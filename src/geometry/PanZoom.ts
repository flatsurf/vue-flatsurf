/*
 * Copyright (c) 2021-2023 Julian Rüth <julian.rueth@fsfe.org>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Box from "@/geometry/Box";
import Polygon from "@/geometry/Polygon";
import Point from "@/geometry/Point";
import Vector from "@/geometry/Vector";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Viewport from "@/geometry/Viewport";


export default class PanZoom {
  constructor (idealCoordinateSystem: CoordinateSystem, dimensions: [number, number]) {
    this.viewport = new Viewport(idealCoordinateSystem, dimensions[0], dimensions[1]);
  }

  focus(focus: Box | Polygon) {
    const changed = (() => {
      if (focus instanceof Box) {
        try {
          return !focus.equalTo(this.viewport.viewport);
        } catch {
          return true;
        }
      }
      return true;
    })();

    if (changed) {
      this.viewport.focus(focus);
      console.assert(JSON.stringify(focus) !== JSON.stringify(this.viewport.viewport), "Changing focus to %s did not modify viewport.", JSON.stringify(focus))
    }

    return changed;
  }

  panzoom(x: number, y: number, dx: number, dy: number, dz: number) {
    // We either zoom or pan; mixing this is probably confusing.
    if (dz !== 0) {
      this.viewport.zoom(Math.exp(-dz/96), new Point(this.viewport.viewportCoordinateSystem, x, y));
    } else {
      this.viewport.focus(this.viewport.viewport.translate(new Vector(
        this.viewport.viewportCoordinateSystem,
        -dx,
        -dy)));
    }
  }

  resize(width: number, height: number) {
    this.viewport.resize(width, height);
    this.focus(this.viewport.viewport);
  }

  destroy() {
    this.viewport.destroy();
  }

  public viewport;
}
