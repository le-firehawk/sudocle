import Button from "./Button"
import { useGame } from "./hooks/useGame"
import { useSettings } from "./hooks/useSettings"
import {
  ACTION_REMOVE,
  ACTION_SET,
  TYPE_CHECK,
  TYPE_COLOURS,
  TYPE_DIGITS,
  TYPE_MODE,
  TYPE_REDO,
  TYPE_UNDO,
} from "./lib/Actions"
import {
  MODE_CENTRE,
  MODE_COLOUR,
  MODE_CORNER,
  MODE_NORMAL,
  MODE_PEN,
  Mode,
  getModeGroup,
} from "./lib/Modes"
import { ktoxy } from "./lib/utils"
import clsx from "clsx"
import Color from "color"
import { Check, Delete, PenTool, Redo, Undo } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"

interface Colour {
  colour: string
  digit: number
  light: boolean
}

const Placeholder = () => <div className="flex flex-1 bg-grey-700/50 rounded" />

const ModeButton = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[0.5rem] font-condensed">{children}</div>
)

const Pad = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { colourPalette, customColours, noobMode, setNoobMode } = useSettings(
    useShallow(state => ({
      colourPalette: state.colourPalette,
      customColours: state.customColours,
      noobMode: state.noobMode,
      setNoobMode: state.setNoobMode,
    })),
  )
  const { data, digits, mode, selection, solved } = useGame(
    useShallow(state => ({
      data: state.data,
      digits: state.digits,
      mode: state.mode,
      selection: state.selection,
      solved: state.solved,
    })),
  )
  const updateGame = useGame(state => state.updateGame)
  const [colours, setColours] = useState<Colour[]>([])
  const [checkReady, setCheckReady] = useState(false)
  const hasSelectedDigits = [...selection].some(k => digits.has(k))

  useEffect(() => {
    let computedStyle = getComputedStyle(ref.current!)
    let nColours = +computedStyle.getPropertyValue("--colors")
    let newColours: Colour[] = []
    if (colourPalette !== "custom" || customColours.length === 0) {
      for (let i = 0; i < nColours; ++i) {
        let col = computedStyle.getPropertyValue(`--color-${i + 1}`)
        let pos = +computedStyle.getPropertyValue(`--color-${i + 1}-pos`)
        newColours[pos - 1] = {
          colour: col,
          digit: i + 1,
          light: Color(col.trim()).luminosity() > 0.9,
        }
      }
    } else {
      for (let i = 0; i < customColours.length; ++i) {
        let col = customColours[i]
        newColours[i] = {
          colour: col,
          digit: i + 1,
          light: Color(col.trim()).luminosity() > 0.9,
        }
      }
    }
    setColours(newColours)
  }, [colourPalette, customColours])

  useEffect(() => {
    // check if all cells are filled
    if (data === undefined) {
      setCheckReady(false)
    } else {
      let nCells = data.cells.reduce((acc, v) => acc + v.length, 0)
      setCheckReady(nCells === digits.size)
    }
  }, [data, digits])

  function onDigit(digit: number) {
    updateGame({
      type: TYPE_DIGITS,
      action: ACTION_SET,
      digit,
    })
  }

  function onColour(digit: number) {
    updateGame({
      type: TYPE_COLOURS,
      action: ACTION_SET,
      digit,
    })
  }

  function onMode(mode: Mode) {
    updateGame({
      type: TYPE_MODE,
      action: ACTION_SET,
      mode,
    })
  }

  function onDelete() {
    updateGame({
      type: TYPE_DIGITS,
      action: ACTION_REMOVE,
    })
  }

  function onUndo() {
    updateGame({
      type: TYPE_UNDO,
    })
  }

  function onRedo() {
    updateGame({
      type: TYPE_REDO,
    })
  }

  function onCheck() {
    updateGame({
      type: TYPE_CHECK,
    })
  }

  const digitCounts = new Map<number, number>()
  digits.forEach(({ digit }) => {
    if (typeof digit === "number" && digit >= 1 && digit <= 9) {
      digitCounts.set(digit, (digitCounts.get(digit) ?? 0) + 1)
    }
  })

  function getConflictingDigits() {
    let conflictingDigits = new Set<number>()
    if (!noobMode || mode !== MODE_NORMAL || selection.size === 0) {
      return conflictingDigits
    }

    let selectedCells = [...selection]
    let selectedCellSet = new Set(selectedCells)
    for (let selectedCell of selectedCells) {
      let [selectedX, selectedY] = ktoxy(selectedCell)
      let selectedRegions = data.regions.filter(region =>
        region.some(([row, col]) => row === selectedY && col === selectedX),
      )

      digits.forEach(({ digit }, digitCell) => {
        if (
          selectedCellSet.has(digitCell) ||
          typeof digit !== "number" ||
          digit < 1 ||
          digit > 9
        ) {
          return
        }

        let [digitX, digitY] = ktoxy(digitCell)
        let sameRegion = selectedRegions.some(region =>
          region.some(([row, col]) => row === digitY && col === digitX),
        )
        if (
          digitX === selectedX ||
          digitY === selectedY ||
          sameRegion
        ) {
          conflictingDigits.add(digit)
        }
      })
    }

    return conflictingDigits
  }

  const conflictingDigits = getConflictingDigits()
  const digitButtons = []

  let modeGroup = mode === MODE_PEN ? 0 : getModeGroup(mode)
  if (modeGroup === 0) {
    if (mode !== MODE_COLOUR && mode !== MODE_PEN) {
      for (let i = 1; i <= 10; ++i) {
        let digit = i % 10
        let missing =
          digit === 0
            ? undefined
            : Math.max(0, 9 - (digitCounts.get(digit) ?? 0))
        let hasConflict = mode === MODE_NORMAL && conflictingDigits.has(digit)
        let disabled =
          mode === MODE_NORMAL && (missing === 0 || hasConflict)
        digitButtons.push(
          <Button
            key={i}
            disabled={disabled}
            noPadding
            onClick={() => onDigit(digit)}
          >
            <div
              className={clsx(
                "relative flex flex-1 items-center justify-center",
                {
                  "text-[1.15rem]": mode === MODE_NORMAL,
                  "text-[0.6rem]": mode === MODE_CENTRE,
                  [clsx({
                    "text-[0.55rem] absolute": true,
                    "top-[0.2rem] left-[0.4rem]": digit === 0 || digit === 1,
                    "top-[0.2rem]": digit === 2,
                    "top-[0.2rem] right-[0.4rem]": digit === 3,
                    "left-[0.4rem]": digit === 4,
                    "right-[0.4rem]": digit === 6,
                    "bottom-[0.2rem] left-[0.4rem]": digit === 7,
                    "bottom-[0.2rem]": digit === 8,
                    "bottom-[0.2rem] right-[0.4rem]": digit === 9,
                  })]: mode === MODE_CORNER,
                },
              )}
            >
              <div
                className={clsx({
                  "line-through decoration-2 decoration-red-500": hasConflict,
                })}
              >
                {digit}
              </div>
              {missing !== undefined && mode === MODE_NORMAL && (
                <div
                  className={clsx(
                    "absolute bottom-0.5 right-1 text-[0.45rem] leading-none",
                    disabled ? "text-fg/50" : "text-fg/70",
                  )}
                  aria-label={`${missing} missing ${digit}s`}
                >
                  {missing}
                </div>
              )}
            </div>
          </Button>,
        )
      }
    } else if (mode === MODE_COLOUR) {
      for (let c of colours) {
        if (c === undefined) {
          continue
        }
        digitButtons.push(
          <Button key={c.digit} noPadding onClick={() => onColour(c.digit)}>
            <div
              className={clsx("flex flex-1 h-full rounded", {
                "border border-grey-500": c.light,
              })}
              style={{ backgroundColor: c.colour }}
            ></div>
          </Button>,
        )
      }
      while (digitButtons.length < 12) {
        digitButtons.push(<div></div>)
      }
    } else if (mode === MODE_PEN) {
      while (digitButtons.length < 12) {
        digitButtons.push(<Placeholder />)
      }
    }
  } else {
    while (digitButtons.length < 12) {
      digitButtons.push(<Placeholder />)
    }
  }

  return (
    <div
      className="grid grid-cols-[repeat(4,2rem)] portrait:grid-cols-[repeat(4,minmax(2rem,3rem))] grid-rows-[repeat(5,2rem)] gap-1 ml-4 lg:ml-11 portrait:ml-0 mt-0 portrait:mt-2.5"
      ref={ref}
    >
      <Button noPadding onClick={onDelete}>
        <div className="flex flex-1 items-center justify-center mr-[0.1rem]">
          <Delete size="1.05rem" />
        </div>
      </Button>
      <Button noPadding onClick={onUndo}>
        <Undo size="1.05rem" />
      </Button>
      <Button noPadding onClick={onRedo}>
        <Redo size="1.05rem" />
      </Button>
      {(modeGroup === 0 && (
        <Button
          active={mode === MODE_NORMAL}
          noPadding
          onClick={() => onMode(MODE_NORMAL)}
        >
          <ModeButton>Normal</ModeButton>
        </Button>
      )) || (
        <Button
          active={mode === MODE_PEN}
          noPadding
          onClick={() => onMode(MODE_PEN)}
        >
          <ModeButton>Pen</ModeButton>
        </Button>
      )}
      {digitButtons[0]}
      {digitButtons[1]}
      {digitButtons[2]}
      {(modeGroup === 0 && (
        <Button
          active={mode === MODE_CORNER}
          disabled={hasSelectedDigits}
          noPadding
          onClick={() => onMode(MODE_CORNER)}
        >
          <ModeButton>Corner</ModeButton>
        </Button>
      )) || <Placeholder />}
      {digitButtons[3]}
      {digitButtons[4]}
      {digitButtons[5]}
      {(modeGroup === 0 && (
        <Button
          active={mode === MODE_CENTRE}
          disabled={hasSelectedDigits}
          noPadding
          onClick={() => onMode(MODE_CENTRE)}
        >
          <ModeButton>Centre</ModeButton>
        </Button>
      )) || <Placeholder />}
      {digitButtons[6]}
      {digitButtons[7]}
      {digitButtons[8]}
      {(modeGroup === 0 && (
        <Button
          active={mode === MODE_COLOUR}
          noPadding
          onClick={() => onMode(MODE_COLOUR)}
        >
          <ModeButton>Colour</ModeButton>
        </Button>
      )) || <Placeholder />}
      {mode !== MODE_COLOUR && (
        <>
          <div className="flex col-span-2">
            {modeGroup === 0 ? (
              <Button
                active={noobMode}
                noPadding
                onClick={() => setNoobMode(!noobMode)}
              >
                <ModeButton>n00b</ModeButton>
              </Button>
            ) : (
              <Placeholder />
            )}
          </div>
          <Button
            noPadding
            onClick={() => onMode(mode === MODE_PEN ? MODE_NORMAL : MODE_PEN)}
            active={mode === MODE_PEN}
          >
            <div className="flex items-center gap-1 text-[0.5rem] font-condensed">
              <PenTool size="0.75rem" />
              <span>Pen</span>
            </div>
          </Button>
        </>
      )}
      {mode === MODE_COLOUR && (
        <>
          {digitButtons[9]}
          {digitButtons[10]}
          {digitButtons[11]}
        </>
      )}
      <Button noPadding onClick={onCheck} pulsating={!solved && checkReady}>
        <Check size="1.05rem" />
      </Button>
    </div>
  )
}

export default Pad
