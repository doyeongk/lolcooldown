import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CDRAGON_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1";
const CDRAGON_ASSET_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");

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

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadImage(
  url: string,
  localPath: string
): Promise<boolean> {
  // Skip if already exists
  if (fs.existsSync(localPath)) {
    return true;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  Failed to download ${url}: ${response.status}`);
      return false;
    }
    const buffer = await response.arrayBuffer();
    ensureDir(path.dirname(localPath));
    fs.writeFileSync(localPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.warn(`  Error downloading ${url}:`, error);
    return false;
  }
}

function getCdragonUrl(assetPath: string): string {
  // CDragon paths look like: /lol-game-data/assets/ASSETS/Characters/Ahri/...
  const relativePath = assetPath.replace("/lol-game-data/assets/", "");
  return CDRAGON_ASSET_BASE + relativePath.toLowerCase();
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

async function downloadChampionIcon(
  championKey: string,
  assetPath: string
): Promise<string> {
  const url = getCdragonUrl(assetPath);
  const ext = path.extname(assetPath) || ".png";
  const localPath = path.join(IMAGES_DIR, "champions", `${championKey}${ext}`);
  const webPath = `/images/champions/${championKey}${ext}`;

  await downloadImage(url, localPath);
  return webPath;
}

async function downloadAbilityIcon(
  championKey: string,
  slot: string,
  assetPath: string
): Promise<string> {
  const url = getCdragonUrl(assetPath);
  const ext = path.extname(assetPath) || ".png";
  const localPath = path.join(
    IMAGES_DIR,
    "abilities",
    championKey,
    `${slot}${ext}`
  );
  const webPath = `/images/abilities/${championKey}/${slot}${ext}`;

  await downloadImage(url, localPath);
  return webPath;
}

async function downloadSkinSplash(
  skinId: number,
  assetPath: string
): Promise<string> {
  const url = getCdragonUrl(assetPath);
  const ext = path.extname(assetPath) || ".jpg";
  const localPath = path.join(IMAGES_DIR, "splashes", `${skinId}${ext}`);
  const webPath = `/images/splashes/${skinId}${ext}`;

  await downloadImage(url, localPath);
  return webPath;
}

async function downloadSkinTile(
  skinId: number,
  assetPath: string
): Promise<string> {
  const url = getCdragonUrl(assetPath);
  const ext = path.extname(assetPath) || ".jpg";
  const localPath = path.join(IMAGES_DIR, "tiles", `${skinId}${ext}`);
  const webPath = `/images/tiles/${skinId}${ext}`;

  await downloadImage(url, localPath);
  return webPath;
}

async function seedChampion(
  summary: CDragonChampionSummary,
  champion: CDragonChampion
): Promise<void> {
  const slotMap: Record<string, string> = { q: "Q", w: "W", e: "E", r: "R" };
  const championKey = champion.alias.toLowerCase();

  // Download champion icon
  const championIconPath = await downloadChampionIcon(
    championKey,
    summary.squarePortraitPath
  );

  // Download ability icons
  const passiveIconPath = await downloadAbilityIcon(
    championKey,
    "P",
    champion.passive.abilityIconPath
  );

  const spellIcons: Record<string, string> = {};
  for (const spell of champion.spells) {
    const slot = slotMap[spell.spellKey];
    if (!slot) continue;
    spellIcons[slot] = await downloadAbilityIcon(
      championKey,
      slot,
      spell.abilityIconPath
    );
  }

  // Download skin images (only base skin splash to keep size manageable)
  const skinPaths: Record<
    number,
    { splashPath: string; tilePath: string }
  > = {};
  for (const skin of champion.skins) {
    // Only download base skin to save space/time, others use CDragon
    if (skin.isBase) {
      skinPaths[skin.id] = {
        splashPath: await downloadSkinSplash(skin.id, skin.splashPath),
        tilePath: await downloadSkinTile(skin.id, skin.tilePath),
      };
    } else {
      skinPaths[skin.id] = {
        splashPath: getCdragonUrl(skin.splashPath),
        tilePath: getCdragonUrl(skin.tilePath),
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    // Upsert champion
    const dbChampion = await tx.champion.upsert({
      where: { riotId: champion.id },
      create: {
        riotId: champion.id,
        key: champion.alias,
        name: champion.name,
        title: champion.title,
        icon: championIconPath,
        roles: champion.roles,
      },
      update: {
        key: champion.alias,
        name: champion.name,
        title: champion.title,
        icon: championIconPath,
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
        icon: passiveIconPath,
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
          icon: spellIcons[slot],
          cooldowns: spell.cooldownCoefficients.slice(0, 5),
          affectedByCdr: !STATIC_COOLDOWN_ABILITIES.has(abilityKey),
          costs: spell.costCoefficients.slice(0, 5),
        },
      });
    }

    // Insert skins
    for (const skin of champion.skins) {
      const paths = skinPaths[skin.id];
      await tx.skin.create({
        data: {
          championId: dbChampion.id,
          riotId: skin.id,
          name: skin.name,
          isBase: skin.isBase,
          rarity: skin.rarity.replace(/^k/, "") || null, // "kMythic" → "Mythic"
          isLegacy: skin.isLegacy,
          splashPath: paths.splashPath,
          tilePath: paths.tilePath,
        },
      });
    }
  });
}

async function main(): Promise<void> {
  console.log("Starting database seed (CDragon)...\n");

  // Create image directories
  console.log("Creating image directories...");
  ensureDir(path.join(IMAGES_DIR, "champions"));
  ensureDir(path.join(IMAGES_DIR, "abilities"));
  ensureDir(path.join(IMAGES_DIR, "splashes"));
  ensureDir(path.join(IMAGES_DIR, "tiles"));

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
