import { DrawOptionField, GridElement } from "./GridElement"
import { ThemeColours } from "./ThemeColours"
import { Graphics } from "pixi.js"

class RegionElement implements GridElement {
  private region: number[]
  readonly graphics: Graphics

  constructor(region: number[]) {
    this.region = region
    this.graphics = new Graphics()
  }

  clear() {
    this.graphics.clear()
  }

  drawOptionsToMemoize(): DrawOptionField[] {
    return [DrawOptionField.CellSize, DrawOptionField.ThemeColours]
  }

  draw(options: { cellSize: number; themeColours: ThemeColours }) {
    let points = this.region.map(v => v * options.cellSize)
    this.graphics.moveTo(points[0], points[1])
    for (let i = 2; i < points.length; i += 2) {
      this.graphics.lineTo(points[i], points[i + 1])
    }
    this.graphics.closePath()
    this.graphics.stroke({
      width: 3.25,
      color: options.themeColours.foregroundColor,
      alpha: 0.86,
      join: "round",
      cap: "round",
    })
  }
}

export default RegionElement
