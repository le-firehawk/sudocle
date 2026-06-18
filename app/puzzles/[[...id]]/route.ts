import emptyGrid from "../../../public/empty-grid.json" assert { type: "json" }
import { NextRequest } from "next/server"

const URLS = [
  "https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/{}?alt=media",
  "https://sudokupad.app/api/puzzle/{}",
]

const PRELOAD_PUZZLE_IDS = [
  "tjN9LtrrTL",
  "rb7G2grJmN",
  "QM8RdBLBb9",
  "Qm88j7J2dt",
  "6dP4FN27HB",
]

const MAX_AGE_EMPTY_SECONDS = 1209600 // 14 days
const MAX_AGE_OTHER = 86400 // 1 day

function randomPreloadPuzzleUrl(): string {
  let id =
    PRELOAD_PUZZLE_IDS[Math.floor(Math.random() * PRELOAD_PUZZLE_IDS.length)]
  return URLS[Math.floor(Math.random() * URLS.length)].replace("{}", id)
}

async function puzzleResponseFromFetch(
  response: Response,
  cacheControl = `max-age=${MAX_AGE_OTHER}`,
): Promise<Response | undefined> {
  if (response.status !== 200) {
    return undefined
  }

  let r = new Response(await response.text())
  r.headers.set("cache-control", cacheControl)
  return r
}

async function loadPuzzleFromUrl(
  url: string,
  cacheControl?: string,
): Promise<Response | undefined> {
  return puzzleResponseFromFetch(await fetch(url), cacheControl)
}

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id?: string[] }> },
): Promise<Response> {
  let params = await context.params

  try {
    if (params.id === undefined || params.id.length === 0) {
      if (process.env.PRELOAD_PUZZLES === "1") {
        let r = await loadPuzzleFromUrl(randomPreloadPuzzleUrl(), "no-store")
        if (r !== undefined) {
          return r
        }
      }

      let r = new Response(JSON.stringify(emptyGrid))
      r.headers.set("cache-control", `max-age=${MAX_AGE_EMPTY_SECONDS}`)
      return r
    }

    let id = params.id.join("/")
    let urls = URLS.map(url => url.replace("{}", id))

    let response: Response | undefined
    for (let url of urls) {
      response = await fetch(url)
      let r = await puzzleResponseFromFetch(response)
      if (r !== undefined) {
        return r
      }
    }

    if (response === undefined) {
      return new Response("No puzzle loaded", {
        status: 500,
      })
    }

    if (response.status === 404) {
      return new Response(
        `The puzzle with the ID \u2018${id}’ does not exist`,
        {
          status: 404,
        },
      )
    }

    return new Response(
      `Failed to load puzzle with ID \u2018${id}’. ` +
        `Received HTTP status code ${response.status} from server.`,
      {
        status: 500,
      },
    )
  } catch (error) {
    console.error(error)
    return new Response("Internal server error", {
      status: 500,
    })
  }
}
