import Popup from "../reuse/Popup"
import { SeedDifficulty, randomSeedPuzzleId } from "../reuse/seedPuzzle"
import About from "./About"
import Button from "./Button"
import ThemeSwitcher from "./ThemeSwitcher"
import { useSettings } from "./hooks/useSettings"
import clsx from "clsx"
import { Info } from "lucide-react"
import { useEffect, useState } from "react"

interface SavedGame {
  id: string
  timestamp: number
  elapsed?: number
  hintsUsed?: number
  mistakes?: number
}

function savedGames(): SavedGame[] {
  if (typeof window === "undefined") return []
  return Object.keys(window.localStorage)
    .filter(k => k.startsWith("SudocleSavedGame_"))
    .map(k => {
      let timestamp = 0
      let elapsed: number | undefined
      let hintsUsed: number | undefined
      let mistakes: number | undefined
      try {
        let saved = JSON.parse(window.localStorage.getItem(k) ?? "{}")
        timestamp = saved.timestamp ?? 0
        elapsed = saved.state?.timerOnPause
        hintsUsed = saved.state?.hintsUsed
        mistakes = saved.state?.mistakes
      } catch {}
      return {
        id: k.substring("SudocleSavedGame_".length),
        timestamp,
        elapsed,
        hintsUsed,
        mistakes,
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)
}

const HomePage = () => {
  const [games, setGames] = useState<SavedGame[]>([])
  const [manualSeed, setManualSeed] = useState("")
  const [aboutOpen, setAboutOpen] = useState(false)
  const { theme, seedDifficulty, setSeedDifficulty } = useSettings()
  useEffect(() => setGames(savedGames()), [])

  function formatElapsed(ms: number | undefined) {
    if (ms === undefined) return "00:00"
    let seconds = Math.max(0, Math.floor(ms / 1000))
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)
    seconds %= 60
    minutes %= 60
    return `${hours > 0 ? `${hours}:` : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  function goTo(id: string) {
    window.location.href = `${process.env.__NEXT_ROUTER_BASEPATH}/${encodeURIComponent(id)}/`
  }

  return (
    <div className="bg-bg text-fg h-dvh overflow-y-auto flex items-start justify-center p-6">
      <main className="w-full max-w-2xl rounded-2xl bg-grey-700/55 p-8 shadow-lg border border-fg-500/30 my-auto">
        <div className="mb-2 flex items-center gap-3">
          <img
            className="h-12 w-auto"
            src={
              theme === "sudocle-dark" || theme === "dark"
                ? require("../assets/logo-white.svg")
                : require("../assets/logo.svg")
            }
            alt="Sudocle"
          />
          <button
            type="button"
            aria-label="About Sudocle"
            className="rounded-full p-1 hover:bg-button-hover"
            onClick={() => setAboutOpen(true)}
          >
            <Info size="1rem" />
          </button>
          <ThemeSwitcher />
        </div>
        <p className="text-fg/70 mb-6">
          Resume a saved puzzle or start a fresh random seed puzzle.
        </p>
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap gap-2 text-[0.6rem]">
            {(
              [
                "beginner",
                "intermediate",
                "hard",
                "expert",
                "hellish",
              ] as SeedDifficulty[]
            ).map(difficulty => (
              <button
                key={difficulty}
                type="button"
                className={clsx(
                  "rounded-full border border-fg-500/50 px-3 py-1 capitalize hover:bg-button-hover",
                  seedDifficulty === difficulty && "bg-button-active",
                )}
                onClick={() => setSeedDifficulty(difficulty)}
              >
                {difficulty}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="h-12 rounded border border-fg-500/50 bg-bg px-3 py-2 text-sm"
              placeholder="Enter a seed"
              value={manualSeed}
              onChange={e => setManualSeed(e.target.value)}
            />
            <div className="h-12">
              <Button
                onClick={() => goTo(manualSeed.trim() || randomSeedPuzzleId())}
              >
                {manualSeed.trim() ? "Start seed" : "New random puzzle"}
              </Button>
            </div>
          </div>
        </div>
        <h2 className="text-lg font-medium mb-3">Saved games</h2>
        {games.length === 0 ? (
          <p className="text-fg/60">No saved games yet.</p>
        ) : (
          <div className="space-y-2">
            {games.map(g => (
              <button
                key={g.id}
                className="w-full text-left rounded-lg bg-bg hover:bg-button-hover px-4 py-3 border border-fg-500/30"
                onClick={() => goTo(g.id)}
              >
                <div className="font-medium break-all">{g.id}</div>
                {g.timestamp > 0 && (
                  <div className="text-xs text-fg/60">
                    Saved {new Date(g.timestamp).toLocaleString()} · Time{" "}
                    {formatElapsed(g.elapsed)} · Hints {g.hintsUsed ?? 0} ·
                    Mistakes {g.mistakes ?? 0}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
      <Popup
        isOpen={aboutOpen}
        title="About Sudocle"
        type="success"
        message={<About />}
        responseButtons={[{ label: "OK" }]}
        onOpenChange={setAboutOpen}
      />
    </div>
  )
}

export default HomePage
