import { SeedDifficulty, randomSeedPuzzleId } from "../reuse/seedPuzzle"
import Button from "./Button"
import { useSettings } from "./hooks/useSettings"
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
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm">
            Difficulty
            <select
              className="ml-2 rounded border border-fg-500/50 bg-bg px-2 py-1 text-sm"
              value={seedDifficulty}
              onChange={e =>
                setSeedDifficulty(e.target.value as SeedDifficulty)
              }
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
              <option value="hellish">Hellish</option>
            </select>
          </label>
          <div className="w-56">
            <Button onClick={() => goTo(randomSeedPuzzleId())}>
              New random puzzle
            </Button>
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
