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

import Point from "./Point";
import Vector from "./Vector";
import CoordinateSystem from "./CoordinateSystem";

export default class Line {
  constructor(pt: Point, norm: Vector);
  constructor(a: Point, b: Point);
  public constructor(pt: Point, norm: Point | Vector) {
    this.parent = pt.parent;
    if (norm instanceof Point)
      this.value = new Flatten.Line(pt.value, this.parent.embed(norm).value);
    else
      this.value = new Flatten.Line(pt.value, this.parent.embed(norm).value);
  }

  public intersect(other: Line): Point | null {
    const intersections = other.parent.embed(this).value.intersect(other.value).map((intersection) => new Point(other.parent, intersection));
    if (intersections.length === 0) return null;
    if (intersections.length !== 1) throw Error("not implemented: Line.intersection()");
    return intersections[0];
  }

  public get pt() { return new Point(this.parent, this.value.pt); }
  public get norm() { return new Vector(this.parent, this.value.norm); }

  public readonly parent: CoordinateSystem;
  public readonly value: Flatten.Line;
}
