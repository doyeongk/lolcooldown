/** Random placement and timing for each mote, drawn once per server render. */
function randomParticles() {
  return Array.from({ length: 18 }, () => {
    const size = 2 + Math.random() * 2
    return {
      left: `${Math.random() * 100}%`,
      width: size,
      height: size,
      opacity: 0.1 + Math.random() * 0.1,
      animationDuration: `${30 + Math.random() * 20}s`,
      animationDelay: `${Math.random() * -30}s`,
    }
  })
}

/** Slow-rising gold motes behind the home screen. Server-rendered; hidden under reduced motion. */
export function GoldParticles() {
  return (
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none motion-reduce:hidden" aria-hidden="true">
      {randomParticles().map((style, i) => (
        <div key={i} className="absolute rounded-full bg-gold animate-particle-float" style={style} />
      ))}
    </div>
  )
}
