import { useGame } from "./hooks/useGame"
import { TYPE_PAUSE } from "./lib/Actions"
import { Pause } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface TimerProps {
  solved: boolean
}

function elapsedParts(ms: number): [number, number, number] {
  let elapsedSeconds = Math.max(0, Math.floor(ms / 1000))
  let seconds = elapsedSeconds % 60
  let minutes = Math.floor((elapsedSeconds / 60) % 60)
  let hours = Math.floor(elapsedSeconds / 60 / 60)
  return [hours, minutes, seconds]
}

const Timer = ({ solved }: TimerProps) => {
  const paused = useGame(state => state.paused)
  const timerOnPause = useGame(state => state.timerOnPause)
  const startedAt = useGame(state => state.startedAt)
  const completedAt = useGame(state => state.completedAt)
  const updateGame = useGame(state => state.updateGame)
  const [now, setNow] = useState(+new Date())

  let elapsed = paused ? timerOnPause : (completedAt ?? now) - startedAt
  let [h, m, s] = elapsedParts(elapsed)

  const onPause = useCallback(() => {
    updateGame({
      type: TYPE_PAUSE,
      timerOnPause: Math.max(0, (completedAt ?? +new Date()) - startedAt),
    })
  }, [updateGame, completedAt, startedAt])

  useEffect(() => {
    if (paused || solved) {
      return
    }
    let nextTick = window.setTimeout(() => setNow(+new Date()), 1000)
    return () => window.clearTimeout(nextTick)
  }, [now, paused, solved])

  return (
    <div className="flex items-center leading-none">
      {h > 0 && <>{String(h).padStart(2, "0")}:</>}
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      <div
        className="cursor-pointer pl-0.5 h-3 flex items-center"
        onClick={onPause}
      >
        <Pause
          stroke="none"
          className="[&_rect]:[rx:1] leading-none h-[0.6rem] fill-fg"
        />
      </div>
    </div>
  )
}

export default Timer
