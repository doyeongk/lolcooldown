/**
 * Static list of champion icon paths for the IconWall background.
 * These are local images downloaded during seeding.
 *
 * Note: This list is manually maintained but could be auto-generated
 * during the seed process in the future.
 */
export const CHAMPION_ICONS: string[] = [
  "/images/champions/alistar.png",
  "/images/champions/amumu.png",
  "/images/champions/anivia.png",
  "/images/champions/annie.png",
  "/images/champions/ashe.png",
  "/images/champions/chogath.png",
  "/images/champions/corki.png",
  "/images/champions/drmundo.png",
  "/images/champions/evelynn.png",
  "/images/champions/fiddlesticks.png",
  "/images/champions/galio.png",
  "/images/champions/gangplank.png",
  "/images/champions/irelia.png",
  "/images/champions/janna.png",
  "/images/champions/jax.png",
  "/images/champions/karma.png",
  "/images/champions/karthus.png",
  "/images/champions/kassadin.png",
  "/images/champions/kayle.png",
  "/images/champions/leblanc.png",
  "/images/champions/masteryi.png",
  "/images/champions/missfortune.png",
  "/images/champions/morgana.png",
  "/images/champions/nunu.png",
  "/images/champions/olaf.png",
  "/images/champions/rammus.png",
  "/images/champions/ryze.png",
  "/images/champions/shaco.png",
  "/images/champions/singed.png",
  "/images/champions/sion.png",
  "/images/champions/sivir.png",
  "/images/champions/sona.png",
  "/images/champions/soraka.png",
  "/images/champions/taric.png",
  "/images/champions/teemo.png",
  "/images/champions/tristana.png",
  "/images/champions/tryndamere.png",
  "/images/champions/twistedfate.png",
  "/images/champions/twitch.png",
  "/images/champions/urgot.png",
  "/images/champions/veigar.png",
  "/images/champions/vladimir.png",
  "/images/champions/warwick.png",
  "/images/champions/xinzhao.png",
  "/images/champions/zilean.png",
]

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Split array into chunks of specified size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
