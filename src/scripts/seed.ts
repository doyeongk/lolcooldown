import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CDRAGON_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1";

// CDragon interfaces
interface CDragonChampionSummary {
  id: number;
  name: string;
  alias: string;
  squarePortraitPath: string;
  roles: string[];
}

interface CDragonChampion {
  id: number;
  name: string;
  alias: string;
  title: string;
  roles: string[];
  passive: CDragonPassive;
  spells: CDragonSpell[];
  skins: CDragonSkin[];
}

interface CDragonPassive {
  name: string;
  abilityIconPath: string;
}

interface CDragonSpell {
  spellKey: string;
  name: string;
  description: string;
  abilityIconPath: string;
  cooldownCoefficients: number[];
  costCoefficients: number[];
}

interface CDragonSkin {
  id: number;
  name: string;
  isBase: boolean;
  rarity: string;
  splashPath: string;
  tilePath: string;
  isLegacy: boolean;
}

// Known abilities with static cooldowns (not affected by CDR/ability haste)
const STATIC_COOLDOWN_ABILITIES = new Set([
  "Anivia:P", // Rebirth
  "Zac:P", // Cell Division
  "Aatrox:P", // Deathbringer Stance
]);

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchChampionList(): Promise<CDragonChampionSummary[]> {
  console.log("Fetching champion list from CDragon...");
  const response = await fetch(`${CDRAGON_BASE}/champion-summary.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch champion list: ${response.statusText}`);
  }
  const data: CDragonChampionSummary[] = await response.json();
  // Filter out placeholder (id: -1) and non-playable entries (id > 1000)
  return data.filter((c) => c.id > 0 && c.id < 1000);
}

async function fetchChampion(id: number): Promise<CDragonChampion> {
  const response = await fetch(`${CDRAGON_BASE}/champions/${id}.json`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch champion ${id}: ${response.statusText}`
    );
  }
  return response.json();
}

function normaliseIconPath(path: string): string {
  // CDragon paths look like: /lol-game-data/assets/ASSETS/Characters/Ahri/...
  // The CDN requires lowercase paths
  const base = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/";
  const relativePath = path.replace("/lol-game-data/assets/", "");
  return base + relativePath.toLowerCase();
}

async function seedChampion(
  summary: CDragonChampionSummary,
  champion: CDragonChampion
): Promise<void> {
  const slotMap: Record<string, string> = { q: "Q", w: "W", e: "E", r: "R" };

  await prisma.$transaction(async (tx) => {
    // Upsert champion
    const dbChampion = await tx.champion.upsert({
      where: { riotId: champion.id },
      create: {
        riotId: champion.id,
        key: champion.alias,
        name: champion.name,
        title: champion.title,
        icon: normaliseIconPath(summary.squarePortraitPath),
        roles: champion.roles,
      },
      update: {
        key: champion.alias,
        name: champion.name,
        title: champion.title,
        icon: normaliseIconPath(summary.squarePortraitPath),
        roles: champion.roles,
      },
    });

    // Delete existing abilities and skins for clean re-seed
    await tx.ability.deleteMany({ where: { championId: dbChampion.id } });
    await tx.skin.deleteMany({ where: { championId: dbChampion.id } });

    // Insert passive (no cooldown data in CDragon passive)
    const passiveKey = `${champion.name}:P`;
    await tx.ability.create({
      data: {
        championId: dbChampion.id,
        slot: "P",
        name: champion.passive.name,
        icon: normaliseIconPath(champion.passive.abilityIconPath),
        cooldowns: [],
        affectedByCdr: !STATIC_COOLDOWN_ABILITIES.has(passiveKey),
        costs: [],
      },
    });

    // Insert spells (Q, W, E, R)
    for (const spell of champion.spells) {
      const slot = slotMap[spell.spellKey];
      if (!slot) continue;

      const abilityKey = `${champion.name}:${slot}`;
      await tx.ability.create({
        data: {
          championId: dbChampion.id,
          slot,
          name: spell.name,
          description: spell.description || null,
          icon: normaliseIconPath(spell.abilityIconPath),
          cooldowns: spell.cooldownCoefficients.slice(0, 5),
          affectedByCdr: !STATIC_COOLDOWN_ABILITIES.has(abilityKey),
          costs: spell.costCoefficients.slice(0, 5),
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
          rarity: skin.rarity.replace(/^k/, "") || null, // "kMythic" → "Mythic"
          isLegacy: skin.isLegacy,
          splashPath: normaliseIconPath(skin.splashPath),
          tilePath: normaliseIconPath(skin.tilePath),
        },
      });
    }
  });
}

async function main(): Promise<void> {
  console.log("Starting database seed (CDragon)...\n");

  const championList = await fetchChampionList();
  console.log(`Found ${championList.length} champions to seed\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < championList.length; i++) {
    const summary = championList[i];
    const progress = `[${i + 1}/${championList.length}]`;

    try {
      const champion = await fetchChampion(summary.id);
      await seedChampion(summary, champion);
      console.log(`${progress} ✓ ${champion.name}`);
      successCount++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`${progress} ✗ ${summary.name}: ${errorMessage}`);
      errors.push(`${summary.name}: ${errorMessage}`);
      errorCount++;
    }

    // Rate limiting: 50ms delay between requests
    if (i < championList.length - 1) {
      await sleep(50);
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
    await pool.end();
  });
