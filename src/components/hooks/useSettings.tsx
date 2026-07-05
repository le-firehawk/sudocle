import { SeedDifficulty } from "../../reuse/seedPuzzle"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

interface Settings {
  colourPalette: string
  theme: string
  selectionColour: "yellow" | "red" | "green" | "blue"
  customColours: string[]
  zoom: number
  fontSizeFactorDigits: number
  fontSizeFactorCornerMarks: number
  fontSizeFactorCentreMarks: number
  penWidth: number
  penOpacity: number
  safetyMode: boolean
  noobMode: boolean
  selectionPulse: boolean
  seedDifficulty: SeedDifficulty

  setColourPalette(colourPalette: string): void
  setTheme(theme: string): void
  setSelectionColour(selectionColour: Settings["selectionColour"]): void
  setCustomColours(customColours: string[]): void
  setZoom(zoom: number): void
  setFontSizeFactorDigits(fontSizeFactorDigits: number): void
  setFontSizeFactorCornerMarks(fontSizeFactorCornerMarks: number): void
  setFontSizeFactorCentreMarks(fontSizeFactorCentreMarks: number): void
  setPenWidth(penWidth: number): void
  setPenOpacity(penOpacity: number): void
  setSafetyMode(safetyMode: boolean): void
  setNoobMode(noobMode: boolean): void
  setSelectionPulse(selectionPulse: boolean): void
  setSeedDifficulty(seedDifficulty: SeedDifficulty): void
}

export const useSettings = create<Settings>()(
  persist(
    immer(set => ({
      colourPalette: "default",
      theme: "default",
      selectionColour: "yellow",
      customColours: [],
      zoom: 1,
      fontSizeFactorDigits: 1,
      fontSizeFactorCornerMarks: 1,
      fontSizeFactorCentreMarks: 1,
      penWidth: 2,
      penOpacity: 1,
      safetyMode: false,
      noobMode: false,
      selectionPulse: false,
      seedDifficulty: "hard",

      setColourPalette: (colourPalette: string) => {
        set(draft => {
          draft.colourPalette = colourPalette
        })
      },

      setTheme: (theme: string) =>
        set(draft => {
          draft.theme = theme === "dark" ? "sudocle-dark" : theme
        }),

      setSelectionColour: (selectionColour: Settings["selectionColour"]) =>
        set(draft => {
          draft.selectionColour = selectionColour
        }),

      setCustomColours: (customColours: string[]) =>
        set(draft => {
          draft.customColours = customColours
        }),

      setZoom: (zoom: number) =>
        set(draft => {
          draft.zoom = zoom
        }),

      setFontSizeFactorDigits: (fontSizeFactorDigits: number) =>
        set(draft => {
          draft.fontSizeFactorDigits = fontSizeFactorDigits
        }),

      setFontSizeFactorCornerMarks: (fontSizeFactorCornerMarks: number) =>
        set(draft => {
          draft.fontSizeFactorCornerMarks = fontSizeFactorCornerMarks
        }),

      setFontSizeFactorCentreMarks: (fontSizeFactorCentreMarks: number) =>
        set(draft => {
          draft.fontSizeFactorCentreMarks = fontSizeFactorCentreMarks
        }),

      setPenWidth: (penWidth: number) =>
        set(draft => {
          draft.penWidth = penWidth
        }),

      setPenOpacity: (penOpacity: number) =>
        set(draft => {
          draft.penOpacity = penOpacity
        }),

      setSafetyMode: (safetyMode: boolean) =>
        set(draft => {
          draft.safetyMode = safetyMode
        }),

      setNoobMode: (noobMode: boolean) =>
        set(draft => {
          draft.noobMode = noobMode
        }),

      setSelectionPulse: (selectionPulse: boolean) =>
        set(draft => {
          draft.selectionPulse = selectionPulse
        }),

      setSeedDifficulty: (seedDifficulty: SeedDifficulty) =>
        set(draft => {
          draft.seedDifficulty = seedDifficulty
        }),
    })),
    {
      name: "SudocleSettings",
    },
  ),
)
