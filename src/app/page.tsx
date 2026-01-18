import { LinkButton } from "@/components/ui/LinkButton"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold italic tracking-tight sm:text-6xl">
        LOLCOOLDOWN
      </h1>
      <p className="mt-4 text-lg text-white">
        Guess which ability has the lower cooldown
      </p>

      <div className="mt-12 flex w-full max-w-md flex-col gap-4">
        <LinkButton
          href="/play/main"
          size="lg"
          variant="gold"
          className="w-full flex-col gap-1"
        >
          <span>Choose Your Champion</span>
          <span className="text-sm font-normal opacity-80">
            Test your main&apos;s abilities
          </span>
        </LinkButton>

        <LinkButton
          href="/play/random"
          size="lg"
          variant="darkBlue"
          className="w-full flex-col gap-1"
        >
          <span>Random Champions</span>
          <span className="text-sm font-normal opacity-80">
            Random abilities, higher stakes
          </span>
        </LinkButton>
      </div>
    </main>
  )
}
