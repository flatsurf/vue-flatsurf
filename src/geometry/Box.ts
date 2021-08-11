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
import Point from "./Point";
import Segment from './Segment';

export default class Box {
  public constructor(parent: CoordinateSystem, box: Flatten.Box);
  public constructor(parent: CoordinateSystem, xy0: [Coordinate, Coordinate], xy1: [Coordinate, Coordinate]);
  public constructor(parent: CoordinateSystem, xy0: [Coordinate, Coordinate] | Flatten.Box, xy1?: [Coordinate, Coordinate]) {
    this.parent = parent;

    if (xy0 instanceof Flatten.Box) {
      this.value = xy0;
    } else {
      console.assert(xy1 instanceof Array);
      this.value = new Flatten.Box(Math.min(xy0[0], xy1![0]), Math.min(xy0[1], xy1![1]), Math.max(xy0[0], xy1![0]), Math.max(xy0[1], xy1![1]));
    }
  }

  public static bbox(shapes: Array<Point|Segment>): Box {
    if (shapes.length === 0)
      throw Error("cannot create bounding box of nothing");

    const boxes = shapes.map((shape) => {
      if (shape instanceof Point)
        return new Box(shape.parent, [shape.value.x, shape.value.y], [shape.value.x, shape.value.y]);
      else
        return new Box(shape.parent, shape.value.box);
    });
    return boxes.reduce((a: Box, b: Box) => a.merge(b));
  }

  // Return an enlargened version of this box that has the prescribed aspect
  // ratio (leaving one of its dimensions untouched and centering it in the
  // other dimension.)
  public contain(aspectRatio: number) {
    if (this.aspectRatio < aspectRatio)
      return new Box(this.parent, [this.value.xmin - (this.height * aspectRatio - this.width) / 2, this.value.ymin], [this.value.xmax + (this.height * aspectRatio - this.width) / 2, this.value.ymax]);
    else
      return new Box(this.parent, [this.value.xmin, this.value.ymin - (this.width / aspectRatio - this.height) / 2], [this.value.xmax, this.value.ymax + (this.width / aspectRatio - this.height) / 2]);
  }

  public merge(other: Box): Box {
    return new Box(this.parent, this.value.merge(this.parent.embed(other).value.box));
  }

  public translate(x: Coordinate, y: Coordinate) {
    return new Box(this.parent, [this.value.xmin + x, this.value.ymin + y], [this.value.xmax + x, this.value.ymax + y]);
  }

  public get low() {
    return new Point(this.parent, this.value.xmin, this.value.ymin);
  }

  public get high() {
    return new Point(this.parent, this.value.xmax, this.value.ymax);
  }

  public get aspectRatio() {
    return this.width / this.height;
  }

  public get width() {
    return this.value.xmax - this.value.xmin;
  }

  public get center() {
    return new Point(this.parent, (this.value.xmin + this.value.xmax) / 2, (this.value.ymin + this.value.ymax) / 2);
  }

  public get height() {
    return this.value.ymax - this.value.ymin;
  }

  public toPoints() {
    return this.value.toPoints().map((point) => new Point(this.parent, point));
  }

  public equalTo(rhs: Box, epsilon: number = 0): boolean {
    if (this.parent === rhs.parent)
      return this.low.equalTo(rhs.low, epsilon) && this.high.equalTo(rhs.high, epsilon);
    return this.parent.embed(rhs).box.equalTo(this);
  }

  public readonly parent: CoordinateSystem;
  public readonly value: Flatten.Box;
}
