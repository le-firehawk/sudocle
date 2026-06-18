import {
  SeedDifficulty,
  buildSeedPuzzle,
  isSeedPuzzleId,
} from "../reuse/seedPuzzle"
import ThemeSwitcher from "./ThemeSwitcher"
import Timer from "./Timer"
import { useGame } from "./hooks/useGame"
import { useSettings } from "./hooks/useSettings"
import { useSidebar } from "./hooks/useSidebar"
import { TYPE_HINT, TYPE_INIT } from "./lib/Actions"
import { MODE_NORMAL } from "./lib/Modes"
import { ID_ABOUT, ID_HELP, ID_RULES, ID_SETTINGS } from "./lib/SidebarTabs"
import clsx from "clsx"
import { BookOpen, HelpCircle, Info, Sliders } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

const StatusBar = () => {
  const { title, rules, solved, mode, puzzleId, hasSolution, updateGame } =
    useGame(
      useShallow(state => ({
        title: state.data.title,
        rules: state.data.rules,
        solved: state.solved,
        mode: state.mode,
        puzzleId: state.puzzleId,
        hasSolution: state.data.solution !== undefined,
        updateGame: state.updateGame,
      })),
    )
  const { safetyMode, seedDifficulty, setSafetyMode, setSeedDifficulty } =
    useSettings(
      useShallow(state => ({
        safetyMode: state.safetyMode,
        seedDifficulty: state.seedDifficulty,
        setSafetyMode: state.setSafetyMode,
        setSeedDifficulty: state.setSeedDifficulty,
      })),
    )
  const onTabClick = useSidebar(state => state.onTabClick)
  const hintsDisabled =
    seedDifficulty === "expert" || seedDifficulty === "hellish"

  function onDifficultyChange(difficulty: SeedDifficulty) {
    if (
      isSeedPuzzleId(puzzleId) &&
      !window.confirm("Changing difficulty will load a new puzzle. Continue?")
    ) {
      return
    }
    setSeedDifficulty(difficulty)
    if (isSeedPuzzleId(puzzleId)) {
      updateGame({
        type: TYPE_INIT,
        puzzleId,
        data: buildSeedPuzzle(puzzleId, difficulty),
      })
    }
  }

  return (
    <div className="fixed flex md:justify-center items-center w-full bg-grey-700 text-fg text-[0.8rem] font-normal h-(--status-bar-height) md:pt-px justify-between py-0 px-2.5">
      <div className="flex items-center">
        <Timer solved={solved} />
        <button
          type="button"
          disabled={mode !== MODE_NORMAL}
          className={clsx(
            "ml-3 rounded-full border border-fg-500/50 bg-bg px-2 py-0.5 text-[0.55rem] hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-50",
            mode === MODE_NORMAL && safetyMode && "bg-button-active",
          )}
          onClick={() => setSafetyMode(!safetyMode)}
        >
          Safety
        </button>
        <button
          type="button"
          disabled={hintsDisabled || !hasSolution}
          className="ml-3 rounded-full border border-fg-500/50 bg-bg px-2 py-0.5 text-[0.55rem] hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => updateGame({ type: TYPE_HINT })}
        >
          Hint
        </button>
        <select
          aria-label="Select difficulty"
          className="ml-3 rounded-full border border-fg-500/50 bg-bg px-2 py-0.5 text-[0.55rem]"
          value={seedDifficulty}
          onChange={e => onDifficultyChange(e.target.value as SeedDifficulty)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
          <option value="hellish">Hellish</option>
        </select>
        <ThemeSwitcher />
      </div>
      <div className="flex md:hidden">
        {title !== undefined && rules !== undefined && (
          <div
            className="flex ml-2 cursor-pointer hover:text-primary"
            onClick={() => onTabClick(ID_RULES)}
          >
            <BookOpen height="1em" />
          </div>
        )}
        <div
          className="flex ml-2 cursor-pointer hover:text-primary"
          onClick={() => onTabClick(ID_SETTINGS)}
        >
          <Sliders height="1em" />
        </div>
        <div
          className="flex ml-2 cursor-pointer hover:text-primary"
          onClick={() => onTabClick(ID_HELP)}
        >
          <HelpCircle height="1em" />
        </div>
        <div
          className="flex ml-2 cursor-pointer hover:text-primary"
          onClick={() => onTabClick(ID_ABOUT)}
        >
          <Info height="1em" />
        </div>
      </div>
    </div>
  )
}

export default StatusBar
