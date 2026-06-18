import { SeedDifficulty, randomSeedPuzzleId } from "../reuse/seedPuzzle"
import Button from "./Button"
import { useSettings } from "./hooks/useSettings"
import clsx from "clsx"
import { useEffect, useState } from "react"

interface SavedGame {
  id: string
  timestamp: number
}

function savedGames(): SavedGame[] {
  if (typeof window === "undefined") return []
  return Object.keys(window.localStorage)
    .filter(k => k.startsWith("SudocleSavedGame_"))
    .map(k => {
      let timestamp = 0
      try {
        timestamp =
          JSON.parse(window.localStorage.getItem(k) ?? "{}").timestamp ?? 0
      } catch {}
      return { id: k.substring("SudocleSavedGame_".length), timestamp }
    })
    .sort((a, b) => b.timestamp - a.timestamp)
}

const HomePage = () => {
  const [games, setGames] = useState<SavedGame[]>([])
  const [manualSeed, setManualSeed] = useState("")
  const { seedDifficulty, setSeedDifficulty } = useSettings()
  useEffect(() => setGames(savedGames()), [])

  function goTo(id: string) {
    window.location.href = `${process.env.__NEXT_ROUTER_BASEPATH}/${encodeURIComponent(id)}/`
  }

  return (
    <div className="bg-bg text-fg min-h-dvh flex items-center justify-center p-6">
      <main className="w-full max-w-2xl rounded-2xl bg-grey-700/55 p-8 shadow-lg border border-fg-500/30">
        <h1 className="text-3xl font-baloo mb-2">Sudocle</h1>
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="rounded border border-fg-500/50 bg-bg px-3 py-2 text-sm"
              placeholder="Enter a seed"
              value={manualSeed}
              onChange={e => setManualSeed(e.target.value)}
            />
            <div className="w-56">
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
                    Saved {new Date(g.timestamp).toLocaleString()}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
