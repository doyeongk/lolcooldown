import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MERAKI_BASE_URL =
  "https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US";

interface MerakiChampion {
  id: number;
  key: string;
  name: string;
  title: string;
  icon: string;
  resource: string;
  attackType: string;
  adaptiveType: string;
  positions: string[];
  roles: string[];
  faction?: string;
  releaseDate?: string;
  patchLastChanged?: string;
  stats: Record<string, unknown>;
  lore?: string;
  abilities: Record<string, MerakiAbility[]>;
  skins: MerakiSkin[];
}

interface MerakiAbility {
  name: string;
  icon: string;
  targeting?: string;
  affects?: string;
  damageType?: string;
  resource?: string;
  cooldown?: {
    modifiers?: Array<{ values: number[] }>;
    affectedByCdr?: boolean;
  };
  cost?: {
    modifiers?: Array<{ values: number[] }>;
  };
  effects?: unknown[];
  castTime?: string;
  targetRange?: string;
  effectRadius?: string;
}

interface MerakiSkin {
  id: number;
  name: string;
  isBase: boolean;
  availability?: string;
  rarity?: string;
  cost?: number;
  releaseDate?: string;
  splashPath?: string;
  tilePath?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchChampionList(): Promise<Record<string, { key: string }>> {
  console.log("Fetching champion list...");
  const response = await fetch(`${MERAKI_BASE_URL}/champions.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch champion list: ${response.statusText}`);
  }
  return response.json();
}

async function fetchChampion(key: string): Promise<MerakiChampion> {
  const response = await fetch(`${MERAKI_BASE_URL}/champions/${key}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch champion ${key}: ${response.statusText}`);
  }
  return response.json();
}

function extractCooldowns(ability: MerakiAbility): number[] {
  return ability.cooldown?.modifiers?.[0]?.values ?? [];
}

function extractCosts(ability: MerakiAbility): number[] {
  return ability.cost?.modifiers?.[0]?.values ?? [];
}

async function seedChampion(champion: MerakiChampion): Promise<void> {
  const abilitySlots = ["P", "Q", "W", "E", "R"] as const;

  await prisma.$transaction(async (tx) => {
    // Upsert champion
    const dbChampion = await tx.champion.upsert({
      where: { riotId: champion.id },
      create: {
        riotId: champion.id,
        key: champion.key,
        name: champion.name,
        title: champion.title,
        icon: champion.icon,
        resource: champion.resource,
        attackType: champion.attackType,
        adaptiveType: champion.adaptiveType,
        positions: champion.positions,
        roles: champion.roles,
        faction: champion.faction,
        releaseDate: champion.releaseDate,
        patchLastChanged: champion.patchLastChanged,
        stats: champion.stats,
        lore: champion.lore,
      },
      update: {
        key: champion.key,
        name: champion.name,
        title: champion.title,
        icon: champion.icon,
        resource: champion.resource,
        attackType: champion.attackType,
        adaptiveType: champion.adaptiveType,
        positions: champion.positions,
        roles: champion.roles,
        faction: champion.faction,
        releaseDate: champion.releaseDate,
        patchLastChanged: champion.patchLastChanged,
        stats: champion.stats,
        lore: champion.lore,
      },
    });

    // Delete existing abilities and skins for clean re-seed
    await tx.ability.deleteMany({ where: { championId: dbChampion.id } });
    await tx.skin.deleteMany({ where: { championId: dbChampion.id } });

    // Insert abilities
    for (const slot of abilitySlots) {
      const abilities = champion.abilities[slot];
      if (!abilities || abilities.length === 0) continue;

      // Take the first ability for each slot (some champions have multiple forms)
      const ability = abilities[0];

      await tx.ability.create({
        data: {
          championId: dbChampion.id,
          slot,
          name: ability.name,
          icon: ability.icon,
          targeting: ability.targeting,
          affects: ability.affects,
          damageType: ability.damageType,
          resource: ability.resource,
          cooldowns: extractCooldowns(ability),
          affectedByCdr: ability.cooldown?.affectedByCdr ?? true,
          costs: extractCosts(ability),
          effects: ability.effects ?? null,
          castTime: ability.castTime,
          targetRange: ability.targetRange,
          effectRadius: ability.effectRadius,
        },
      });
    }

    // Insert skins
    for (const skin of champion.skins) {
      await tx.skin.create({
        data: {
          championId: dbChampion.id,
          riotId: skin.id,
          name: skin.name,
          isBase: skin.isBase,
          availability: skin.availability,
          rarity: skin.rarity,
          cost: skin.cost,
          releaseDate: skin.releaseDate,
          splashPath: skin.splashPath,
          tilePath: skin.tilePath,
        },
      });
    }
  });
}

async function main(): Promise<void> {
  console.log("Starting database seed...\n");

  const championList = await fetchChampionList();
  const championKeys = Object.keys(championList);
  console.log(`Found ${championKeys.length} champions to seed\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < championKeys.length; i++) {
    const key = championKeys[i];
    const progress = `[${i + 1}/${championKeys.length}]`;

    try {
      const champion = await fetchChampion(key);
      await seedChampion(champion);
      console.log(`${progress} ✓ ${champion.name}`);
      successCount++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`${progress} ✗ ${key}: ${errorMessage}`);
      errors.push(`${key}: ${errorMessage}`);
      errorCount++;
    }

    // Rate limiting: 100ms delay between requests
    if (i < championKeys.length - 1) {
      await sleep(100);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Seed completed!");
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  // Print summary stats
  const [championCount, abilityCount, skinCount] = await Promise.all([
    prisma.champion.count(),
    prisma.ability.count(),
    prisma.skin.count(),
  ]);

  console.log("\nDatabase totals:");
  console.log(`  Champions: ${championCount}`);
  console.log(`  Abilities: ${abilityCount}`);
  console.log(`  Skins: ${skinCount}`);
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
