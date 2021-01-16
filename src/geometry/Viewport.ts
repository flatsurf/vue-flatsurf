/* ******************************************************************************
 * Copyright (c) 2020 Julian Rüth <julian.rueth@fsfe.org>
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
 * *****************************************************************************/

import Flatten from "@flatten-js/core";

import CoordinateSystem from "./CoordinateSystem";
import Box from "./Box";
import Point from "./Point";

export default class Viewport {
  public constructor(ideal?: CoordinateSystem, width: number = 640, height: number = 640) {
    this.idealCoordinateSystem = ideal || new CoordinateSystem(true);
    if (!this.idealCoordinateSystem.positive)
      throw new Error("ideal coordinate system must be positive");
    this.viewportCoordinateSystem = new CoordinateSystem(false);
    this.width = width;
    this.height = height;
    this.visible = new Box(this.viewportCoordinateSystem, [0, 0], [width, height]);
    this.focused = this.visible;

    this.idealCoordinateSystem.embedInto(this.viewportCoordinateSystem);
  }

  // Resize the viewport while keeping the currently focused box unchanged.
  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.focus(this.focused);
  }

  public focus(focused: Box) {
    this.focused = this.idealCoordinateSystem.embed(focused);
    this.visible = this.idealCoordinateSystem.embed(this.focused.contain(this.width / this.height));
    // We now need to embed the "ideal" coordinate system into the actual
    // "viewport" coordinate system so that the "visible" box fills the (0,
    // 0), (width, height) box.
    this.idealCoordinateSystem.embedInto(this.viewportCoordinateSystem, new Flatten.Matrix(
      this.width / this.visible.width, 0,
      0, -this.height / this.visible.height,
      -this.visible.low.x * this.width / this.visible.width,
      this.visible.high.y * this.height / this.visible.height,
    ));
  }

  public zoom(factor: number, center?: Point) {
    if (center === undefined) {
      center = this.viewport.center;
      center = this.focused.parent.embed(center);

      const width = this.focused.width / factor;
      const height = this.focused.height / factor;

      this.focus(new Box(this.focused.parent,
        [center.x - width / 2, center.y - height / 2],
        [center.x + width / 2, center.y + height / 2]));
    } else {
      center = this.idealCoordinateSystem.embed(center);
      const centerBefore = this.viewportCoordinateSystem.embed(center);
      this.zoom(factor);
      const centerAfter = this.viewportCoordinateSystem.embed(center);
      
      this.focus(this.viewport.translate(centerAfter.x - centerBefore.x, centerAfter.y - centerBefore.y));
    }
  }

  public embed(point: Point) : Point;
  public embed(box: Box) : Box;
  public embed(value: Point | Box) : Point | Box {
    return this.viewportCoordinateSystem.embed(value as any);
  }

  public get viewport() : Box {
    return this.viewportCoordinateSystem.embed(this.visible);
  }

  private width: number;
  private height: number;
  // The underlying ideal coordinate system that is stable under resizing the
  // viewport, translating it and such.
  public readonly idealCoordinateSystem: CoordinateSystem;
  // Coordinates on screen, i.e., inside the viewport starting at (0, 0) in
  // the top-left corner.
  public readonly viewportCoordinateSystem: CoordinateSystem;
  // The currently focused rectangle, centered in the viewport.
  private focused: Box;
  // The currently visible rectangle.
  private visible: Box;
};
