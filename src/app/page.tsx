import { HomeScreen } from "@/components/home/HomeScreen"
import { getBaseSplashes } from "@/lib/data/abilities"

// Read splashes per request (memory-cached for an hour) so newly seeded
// champions appear without a rebuild; the Docker build has no database.
export const dynamic = "force-dynamic"

export default async function Home() {
  const splashes = await getBaseSplashes().catch((error) => {
    console.error("Failed to load splashes:", error)
    return []
  })
  return <HomeScreen splashes={splashes} />
}
