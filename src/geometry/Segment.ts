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
  public constructor(start: Point, end: Point);
  public constructor(parent: CoordinateSystem, value: Flatten.Segment);
  public constructor(parent: CoordinateSystem, start: Flatten.Point, end: Flatten.Point);
  public constructor(parent: CoordinateSystem | Point, value: Point | Flatten.Point | Flatten.Segment, end?: Flatten.Point){
    if (!(parent instanceof CoordinateSystem)) {
      console.assert(value instanceof Point, value);
      ({parent, value, end} = {
        parent: parent.parent,
        value: parent.value,
        end: parent.parent.embed(value as Point).value,
      });
    }

    this.parent = parent;
    if (end !== undefined) {
      const start = value as Flatten.Point;
      this.value = new Flatten.Segment(start, end);
    } else {
      this.value = value as Flatten.Segment;
    }
  }
  
  public get start() { return new Point(this.parent, this.value.start); }
  public get middle() { return new Point(this.parent, this.value.middle()); }
  public get end() { return new Point(this.parent, this.value.end); }
  public get tangentInStart() { return new Vector(this.parent, this.value.tangentInStart()); }
  public get tangentInEnd() { return new Vector(this.parent, this.value.tangentInEnd()); }

  public at(relative: number) {
    return this.start.translate(new Vector(this.parent, this.start, this.end).multiply(relative));
  }

  public translate(delta: Vector): Segment {
    delta = this.parent.embed(delta);
    return new Segment(this.parent, this.value.translate(delta.value));
  }

  // Return the points of intersection between this segment and the segments
  // forming the boundary of the polygon. If this segment overlaps with one of
  // the boundary segments, the end points of the overlap are included. If it
  // touches, the point of touching is included.
  public intersect(shape: Polygon): Point[] {
    const intersections = shape.parent.embed(this).value.intersect(shape.value).map(value => new Point(shape.parent, value));
    if(this.start.on(shape))
      // TODO: Bug in flatten.
      intersections.push(this.start);
    if (this.end.on(shape))
      // TODO: Bug in flatten.
      intersections.push(this.end);
    return intersections;
  }

  // Return whether this segment and the (filled) shape have at least one point
  // in common.
  public intersects(shape: Polygon | Segment): boolean {
    if (shape instanceof Polygon)
      return Flatten.Relations.intersect(shape.parent.embed(this).value, shape.value);
    else
      return this.intersects(new Polygon(shape.parent, [[shape.start, shape.end]]));
  }

  // Return the relative coordinate of the point projected onto the segment,
  // i.e., return a value in [0, 1] if the point projects onto the segment.
  public relativize(point: Point): number {
    const e = this.value.tangentInStart();
    const toPoint = new Vector(this.parent, this.start, point).value;
    return e.dot(toPoint) / this.value.length;
  }

  public touch(shape: Polygon): boolean {
    return Flatten.Relations.touch(shape.parent.embed(this).value, shape.value);
  }

  public toString(): string {
    return `((${this.value.start.x}, ${this.value.start.y}), (${this.value.end.x}, ${this.value.end.y}))`;
  }

  public get length() {
    return this.value.length;
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
