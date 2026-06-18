import Popup from "../reuse/Popup"
import {
  SeedDifficulty,
  isSeedPuzzleId,
  randomSeedPuzzleId,
} from "../reuse/seedPuzzle"
import ThemeSwitcher from "./ThemeSwitcher"
import Timer from "./Timer"
import { useGame } from "./hooks/useGame"
import { useSettings } from "./hooks/useSettings"
import { useSidebar } from "./hooks/useSidebar"
import { TYPE_HINT } from "./lib/Actions"
import { MODE_NORMAL } from "./lib/Modes"
import { ID_ABOUT, ID_HELP, ID_RULES, ID_SETTINGS } from "./lib/SidebarTabs"
import clsx from "clsx"
import { BookOpen, HelpCircle, Info, Sliders } from "lucide-react"
import { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow"

const HINT_COOLDOWN_SECONDS: Record<SeedDifficulty, number> = {
  beginner: 10,
  intermediate: 30,
  hard: 60,
  expert: 0,
  hellish: 0,
}

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
  const {
    theme,
    safetyMode,
    seedDifficulty,
    setSafetyMode,
    setSeedDifficulty,
  } = useSettings(
    useShallow(state => ({
      theme: state.theme,
      safetyMode: state.safetyMode,
      seedDifficulty: state.seedDifficulty,
      setSafetyMode: state.setSafetyMode,
      setSeedDifficulty: state.setSeedDifficulty,
    })),
  )
  const onTabClick = useSidebar(state => state.onTabClick)
  const [pendingDifficulty, setPendingDifficulty] = useState<SeedDifficulty>()
  const [hintCooldownUntil, setHintCooldownUntil] = useState(0)
  const [now, setNow] = useState(+new Date())
  const hintsDisabled =
    seedDifficulty === "expert" || seedDifficulty === "hellish"

  useEffect(() => {
    let interval = window.setInterval(() => setNow(+new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  function applyDifficultyChange(difficulty: SeedDifficulty) {
    setSeedDifficulty(difficulty)
    if (isSeedPuzzleId(puzzleId)) {
      let seed = randomSeedPuzzleId()
      window.location.href = `${process.env.__NEXT_ROUTER_BASEPATH}/${seed}/?difficulty=${difficulty}`
    }
  }

  function onDifficultyChange(difficulty: SeedDifficulty) {
    if (isSeedPuzzleId(puzzleId)) {
      setPendingDifficulty(difficulty)
      return
    }
    applyDifficultyChange(difficulty)
  }

  function onHint() {
    updateGame({ type: TYPE_HINT })
    setHintCooldownUntil(
      +new Date() + HINT_COOLDOWN_SECONDS[seedDifficulty] * 1000,
    )
  }

  function goHome() {
    window.location.href = `${process.env.__NEXT_ROUTER_BASEPATH}/`
  }

  function goNewGame() {
    window.location.href = `${process.env.__NEXT_ROUTER_BASEPATH}/${randomSeedPuzzleId()}/`
  }

  let darkTheme = theme === "sudocle-dark" || theme === "dark"

  return (
    <div className="fixed flex items-center w-full bg-grey-700 text-fg text-[0.8rem] font-normal h-(--status-bar-height) md:pt-px justify-between py-0 px-2.5">
      <div className="flex items-center">
        <button
          aria-label="Sudocle home"
          className={clsx(
            "rounded px-2 py-0.5 hover:bg-button-hover",
            !darkTheme && "bg-white/85 shadow-sm",
          )}
          onClick={goHome}
        >
          <img
            className="h-5 w-auto"
            src={
              darkTheme
                ? require("../assets/logo-white.svg")
                : require("../assets/logo.svg")
            }
            alt="Sudocle"
          />
        </button>
        <button
          className="ml-2 rounded px-2 py-0.5 text-[0.55rem] hover:bg-button-hover"
          onClick={goNewGame}
        >
          New Game
        </button>
      </div>
      <div className="flex items-center">
        <Timer solved={solved} />
        <button
          type="button"
          disabled={mode !== MODE_NORMAL}
          className={clsx(
            "ml-3 h-5 rounded-full border border-fg-500/50 bg-bg px-2 text-[0.55rem] leading-none hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-50",
            mode === MODE_NORMAL && safetyMode && "bg-button-active",
          )}
          onClick={() => setSafetyMode(!safetyMode)}
        >
          Safety
        </button>
        <button
          type="button"
          disabled={hintsDisabled || !hasSolution || now < hintCooldownUntil}
          className="ml-3 h-5 min-w-14 rounded-full border border-fg-500/50 bg-bg px-2 text-[0.55rem] leading-none hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onHint}
        >
          {now < hintCooldownUntil
            ? `Hint ${Math.ceil((hintCooldownUntil - now) / 1000)}`
            : "Hint"}
        </button>
        <select
          aria-label="Select difficulty"
          className="ml-3 h-5 min-w-32 rounded-full border border-fg-500/50 bg-bg px-2 text-[0.55rem] leading-none hover:bg-button-hover"
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
      <Popup
        isOpen={pendingDifficulty !== undefined}
        title="Change difficulty?"
        type="warning"
        message="Changing difficulty will load a new puzzle."
        responseButtons={[
          { label: "Cancel", onClick: () => setPendingDifficulty(undefined) },
          {
            label: "Confirm",
            active: true,
            onClick: () => {
              if (pendingDifficulty !== undefined) {
                applyDifficultyChange(pendingDifficulty)
              }
            },
          },
        ]}
        onOpenChange={open => !open && setPendingDifficulty(undefined)}
      />
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
