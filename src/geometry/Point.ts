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

import CoordinateSystem, { Coordinate } from "./CoordinateSystem";

export default class Point {
  public constructor(parent: CoordinateSystem, x: Coordinate, y: Coordinate);
  public constructor(parent: CoordinateSystem, p: Flatten.Point);
  public constructor(parent: CoordinateSystem, x: Coordinate | Flatten.Point, y?: Coordinate) {
    this.parent = parent;
    if (typeof(x) === "number")
      this.value = new Flatten.Point(x, y);
    else
      this.value = x;
  }
  
  public get x() { return this.value.x; }
  public get y() { return this.value.y; }
  public get xy() : [Coordinate, Coordinate] { return [this.x, this.y]; }

  public equalTo(rhs: Point, epsilon: number = 0): boolean {
    if (this.parent === rhs.parent)
      return Math.abs(this.x - rhs.x) <= epsilon && Math.abs(this.y - rhs.y) <= epsilon;
    return this.parent.embed(rhs).equalTo(this);
  }

  public readonly parent: CoordinateSystem;
  public readonly value: Flatten.Point;
}

