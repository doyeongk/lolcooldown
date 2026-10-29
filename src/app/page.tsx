import { HomeScreen } from "@/components/home/HomeScreen"
import { IconWall } from "@/components/home/IconWall"
import { GoldParticles } from "@/components/home/GoldParticles"
import { getBaseSplashes } from "@/lib/data/abilities"

// Rendered per request so newly seeded champions appear without a rebuild
// (splashes are memory-cached for an hour; the Docker build has no database).
export const dynamic = "force-dynamic"

export default async function Home() {
  const splashes = await getBaseSplashes().catch((error) => {
    console.error("Failed to load splashes:", error)
    return []
  })
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <IconWall splashes={splashes} />
      <GoldParticles />
      <HomeScreen />
    </main>
  )
}
