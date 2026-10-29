import Image from "next/image"

const ROWS = 8
const TILES_PER_ROW = 15
const GAP = 6
// Seconds per loop and start offsets, varied per row so the wall never moves in lockstep
const ROW_SPEEDS = [140, 155, 145, 160, 150, 165, 148, 158]
const ROW_DELAYS = [-15, -42, -8, -67, -25, -89, -31, -53]
// Edge rows read as further away (dimmer), centre rows as closer
const ROW_BRIGHTNESS = [0.28, 0.33, 0.4, 0.45, 0.45, 0.4, 0.33, 0.28]

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Brick wall of slowly drifting splash arts behind the home screen.
 * Tile size comes from CSS variables (200×118 mobile, 360×212 from md).
 */
export function IconWall({ splashes }: { splashes: string[] }) {
  if (splashes.length === 0) return null
  const shuffled = shuffle(splashes)

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none [--tile-w:200px] [--tile-h:118px] md:[--tile-w:360px] md:[--tile-h:212px]"
      aria-hidden="true"
    >
      <div
        className="absolute inset-y-0 -left-[5%] flex w-[110%] flex-col justify-center"
        style={{ gap: GAP, filter: "saturate(0.7)" }}
      >
        {Array.from({ length: ROWS }, (_, r) => {
          const row = Array.from({ length: TILES_PER_ROW }, (_, t) => shuffled[(r * TILES_PER_ROW + t) % shuffled.length])
          return (
            <div
              key={r}
              className="flex items-center"
              style={{
                gap: GAP,
                marginLeft: r % 2 ? `calc((var(--tile-w) + ${GAP}px) / 2)` : 0,
                filter: `brightness(${ROW_BRIGHTNESS[r]})`,
              }}
            >
              <div
                className="flex items-center animate-icon-row-scroll"
                style={{
                  gap: GAP,
                  "--row-width": `calc(${TILES_PER_ROW} * (var(--tile-w) + ${GAP}px))`,
                  "--row-speed": `${ROW_SPEEDS[r]}s`,
                  animationDelay: `${ROW_DELAYS[r]}s`,
                } as React.CSSProperties}
              >
                {/* Three copies so the loop never shows an edge */}
                {[...row, ...row, ...row].map((src, i) => (
                  <div key={i} className="relative h-(--tile-h) w-(--tile-w) shrink-0 border-2 border-black/80 ring-1 ring-gold/20">
                    <Image src={src} alt="" fill sizes="(min-width: 768px) 360px, 200px" className="object-cover" draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Depth of field (sharp centre, blurred edges), haze, then a cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          maskImage: "radial-gradient(ellipse 70% 60% at center, transparent 0%, black 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at center, transparent 0%, black 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 85% 75% at center, transparent 20%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.85) 100%),
            radial-gradient(ellipse 80% 70% at center, rgba(15, 13, 10, 0.15) 0%, rgba(15, 13, 10, 0.5) 100%)
          `,
        }}
      />
    </div>
  )
}
