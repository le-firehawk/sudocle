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
    this.graphics.poly(this.region.map(v => v * options.cellSize))
    this.graphics.stroke({
      width: 2,
      color: options.themeColours.foregroundColor,
      alpha: 0.82,
    })
  }
}

export default RegionElement
