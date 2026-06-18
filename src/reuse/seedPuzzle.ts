import { Data, DataCell } from "../components/types/Data"

export const SEED_PUZZLE_ID_LENGTH = 10

const SEED_CHARACTERS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

function xmur3(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

function mulberry32(seed: number): () => number {
  return () => {
    seed += 0x6d2b79f5
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(values: T[], random: () => number): T[] {
  let shuffled = [...values]
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function pattern(row: number, column: number): number {
  return (row * 3 + Math.floor(row / 3) + column) % 9
}

function buildRegions(): [number, number][][] {
  let regions: [number, number][][] = []
  for (let boxY = 0; boxY < 3; boxY++) {
    for (let boxX = 0; boxX < 3; boxX++) {
      let cells: [number, number][] = []
      for (let y = boxY * 3; y < boxY * 3 + 3; y++) {
        for (let x = boxX * 3; x < boxX * 3 + 3; x++) {
          cells.push([x, y])
        }
      }
      regions.push(cells)
    }
  }
  return regions
}

export function isSeedPuzzleId(id: string): boolean {
  return (
    id.length === SEED_PUZZLE_ID_LENGTH &&
    [...id].every(c => SEED_CHARACTERS.includes(c))
  )
}

export function randomSeedPuzzleId(): string {
  let id = ""
  for (let i = 0; i < SEED_PUZZLE_ID_LENGTH; i++) {
    id += SEED_CHARACTERS[Math.floor(Math.random() * SEED_CHARACTERS.length)]
  }
  return id
}

export type SeedDifficulty =
  | "beginner"
  | "intermediate"
  | "hard"
  | "expert"
  | "hellish"

export const SEED_DIFFICULTY_GIVENS: Record<SeedDifficulty, number> = {
  beginner: 49,
  intermediate: 41,
  hard: 24,
  expert: 16,
  hellish: 4,
}

export function buildSeedPuzzle(
  seed: string,
  difficulty: SeedDifficulty = "hard",
): Data {
  let random = mulberry32(xmur3(seed)())
  let rows = shuffle([0, 1, 2], random).flatMap(group =>
    shuffle([0, 1, 2], random).map(row => group * 3 + row),
  )
  let columns = shuffle([0, 1, 2], random).flatMap(group =>
    shuffle([0, 1, 2], random).map(column => group * 3 + column),
  )
  let digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random)
  let solution = rows.map(row =>
    columns.map(column => digits[pattern(row, column)]),
  )
  let visibleCells = new Set<number>()
  let targetGivens = SEED_DIFFICULTY_GIVENS[difficulty]
  while (visibleCells.size < targetGivens) {
    visibleCells.add(Math.floor(random() * 81))
  }
  let cells: DataCell[][] = solution.map((row, y) =>
    row.map((value, x) => (visibleCells.has(y * 9 + x) ? { value } : {})),
  )

  return {
    cellSize: 50,
    cells,
    regions: buildRegions(),
    cages: [],
    lines: [],
    arrows: [],
    underlays: [],
    overlays: [],
    solution,
    title: `Seed ${seed}`,
    author: "Sudocle",
    rules:
      "Classic sudoku. Fill every row, column, and 3x3 box with the digits 1 through 9.",
    solved: false,
  }
}
