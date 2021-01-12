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
import Point from "./Point";
import Polygon from './Polygon';
import Vector from './Vector';

export default class Segment {
  public constructor(parent: CoordinateSystem, value: Flatten.Segment);
  public constructor(parent: CoordinateSystem, start: Flatten.Point, end: Flatten.Point);
  public constructor(parent: CoordinateSystem, value: Flatten.Point | Flatten.Segment, end?: Flatten.Point){
    this.parent = parent;
    if (end !== undefined) {
      const start = value as Flatten.Point;
      this.value = new Flatten.Segment(start, end);
    } else
      this.value = value as Flatten.Segment;
  }
  
  public get start() { return new Point(this.parent, this.value.start); }
  public get end() { return new Point(this.parent, this.value.end); }

  public translate(delta: Vector): Segment {
    delta = this.parent.embed(delta);
    return new Segment(this.parent, this.value.translate(delta.value));
  }

  public intersect(shape: Polygon): boolean {
    return Flatten.Relations.intersect(shape.parent.embed(this).value, shape.value);
  }

  public touch(shape: Polygon): boolean {
    return Flatten.Relations.touch(shape.parent.embed(this).value, shape.value);
  }

  public equalTo(rhs: Segment, epsilon: number = 0): boolean {
    return this.start.equalTo(rhs.start, epsilon) && this.end.equalTo(rhs.end, epsilon);
  }

  public reverse(): Segment {
    return new Segment(this.parent, this.value.reverse());
  }

  public readonly parent: CoordinateSystem;
  public readonly value: Flatten.Segment;
}
