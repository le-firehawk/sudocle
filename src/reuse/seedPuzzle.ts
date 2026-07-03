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
  hard: 30,
  expert: 24,
  hellish: 17,
}

type SeedDifficultyProfile = {
  targetGivens: number
  maximumScore: number
}

const SEED_DIFFICULTY_PROFILES: Record<SeedDifficulty, SeedDifficultyProfile> =
  {
    beginner: { targetGivens: 49, maximumScore: 90 },
    intermediate: { targetGivens: 41, maximumScore: 210 },
    hard: { targetGivens: 30, maximumScore: 520 },
    expert: { targetGivens: 24, maximumScore: 900 },
    hellish: {
      targetGivens: 17,
      maximumScore: Number.POSITIVE_INFINITY,
    },
  }

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function countSolutions(grid: (number | undefined)[][], limit = 2): number {
  let rowUsed = Array.from({ length: 9 }, () => new Set<number>())
  let columnUsed = Array.from({ length: 9 }, () => new Set<number>())
  let boxUsed = Array.from({ length: 9 }, () => new Set<number>())

  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      let value = grid[y][x]
      if (value === undefined) {
        continue
      }
      let box = Math.floor(y / 3) * 3 + Math.floor(x / 3)
      if (
        rowUsed[y].has(value) ||
        columnUsed[x].has(value) ||
        boxUsed[box].has(value)
      ) {
        return 0
      }
      rowUsed[y].add(value)
      columnUsed[x].add(value)
      boxUsed[box].add(value)
    }
  }

  function solve(): number {
    let bestX = -1
    let bestY = -1
    let bestCandidates: number[] | undefined

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (grid[y][x] !== undefined) {
          continue
        }
        let box = Math.floor(y / 3) * 3 + Math.floor(x / 3)
        let candidates = ALL_DIGITS.filter(
          value =>
            !rowUsed[y].has(value) &&
            !columnUsed[x].has(value) &&
            !boxUsed[box].has(value),
        )
        if (candidates.length === 0) {
          return 0
        }
        if (
          bestCandidates === undefined ||
          candidates.length < bestCandidates.length
        ) {
          bestX = x
          bestY = y
          bestCandidates = candidates
          if (candidates.length === 1) {
            break
          }
        }
      }
      if (bestCandidates?.length === 1) {
        break
      }
    }

    if (bestCandidates === undefined) {
      return 1
    }

    let count = 0
    let box = Math.floor(bestY / 3) * 3 + Math.floor(bestX / 3)
    for (let value of bestCandidates) {
      grid[bestY][bestX] = value
      rowUsed[bestY].add(value)
      columnUsed[bestX].add(value)
      boxUsed[box].add(value)

      count += solve()

      grid[bestY][bestX] = undefined
      rowUsed[bestY].delete(value)
      columnUsed[bestX].delete(value)
      boxUsed[box].delete(value)

      if (count >= limit) {
        return count
      }
    }
    return count
  }

  return solve()
}

function clonePuzzleGrid(
  cells: Set<number>,
  solution: number[][],
): (number | undefined)[][] {
  return solution.map((row, y) =>
    row.map((value, x) => (cells.has(y * 9 + x) ? value : undefined)),
  )
}

function getCandidates(
  grid: (number | undefined)[][],
  x: number,
  y: number,
): number[] {
  let boxStartX = Math.floor(x / 3) * 3
  let boxStartY = Math.floor(y / 3) * 3
  return ALL_DIGITS.filter(value => {
    for (let index = 0; index < 9; index++) {
      if (grid[y][index] === value || grid[index][x] === value) {
        return false
      }
    }
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        if (grid[boxStartY + dy][boxStartX + dx] === value) {
          return false
        }
      }
    }
    return true
  })
}

function unitCells(unit: number): [number, number][] {
  if (unit < 9) {
    return Array.from({ length: 9 }, (_, x) => [x, unit])
  }
  if (unit < 18) {
    return Array.from({ length: 9 }, (_, y) => [unit - 9, y])
  }
  let box = unit - 18
  let startX = (box % 3) * 3
  let startY = Math.floor(box / 3) * 3
  return Array.from({ length: 9 }, (_, index) => [
    startX + (index % 3),
    startY + Math.floor(index / 3),
  ])
}

function puzzleDifficultyScore(
  cells: Set<number>,
  solution: number[][],
): number {
  let grid = clonePuzzleGrid(cells, solution)
  let score = 0

  while (true) {
    let progress = false

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (grid[y][x] !== undefined) {
          continue
        }
        let candidates = getCandidates(grid, x, y)
        if (candidates.length === 0) {
          return Number.POSITIVE_INFINITY
        }
        if (candidates.length === 1) {
          grid[y][x] = candidates[0]
          score += 2
          progress = true
        }
      }
    }
    if (progress) {
      continue
    }

    for (let unit = 0; unit < 27; unit++) {
      for (let value of ALL_DIGITS) {
        let locations = unitCells(unit).filter(
          ([x, y]) =>
            grid[y][x] === undefined &&
            getCandidates(grid, x, y).includes(value),
        )
        if (locations.length === 1) {
          let [x, y] = locations[0]
          grid[y][x] = value
          score += 8
          progress = true
        }
      }
    }
    if (progress) {
      continue
    }

    let emptyCells = 0
    let branchPressure = 0
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (grid[y][x] === undefined) {
          emptyCells++
          branchPressure += getCandidates(grid, x, y).length
        }
      }
    }
    if (emptyCells === 0) {
      return score
    }
    return score + emptyCells * 25 + branchPressure * 6
  }
}

function isSuitableForDifficulty(
  cells: Set<number>,
  solution: number[][],
  profile: SeedDifficultyProfile,
): boolean {
  return (
    hasUniqueSolution(cells, solution) &&
    puzzleDifficultyScore(cells, solution) <= profile.maximumScore
  )
}

function hasUniqueSolution(cells: Set<number>, solution: number[][]): boolean {
  return countSolutions(clonePuzzleGrid(cells, solution)) === 1
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
  let visibleCells = new Set(Array.from({ length: 81 }, (_, index) => index))
  let profile = SEED_DIFFICULTY_PROFILES[difficulty]
  for (let cell of shuffle(Array.from(visibleCells), random)) {
    if (visibleCells.size <= profile.targetGivens) {
      break
    }
    visibleCells.delete(cell)
    if (!isSuitableForDifficulty(visibleCells, solution, profile)) {
      visibleCells.add(cell)
    }
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
