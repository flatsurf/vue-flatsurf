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

import assert from "assert";

import Flatten from "@flatten-js/core";

import CoordinateSystem, { Coordinate } from "./CoordinateSystem";
import Vector from './Vector';
import Polygon from './Polygon';

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

  // Compute the convex hull of the points (using the slow Jarvis march
  // algorithm.)
  public static convexHull(points: Point[]): Polygon {
    assert(points.length !== 0);

    const coordinateSystem = points[0].parent;

    const vertices = points.map((p) => coordinateSystem.embed(p).value);

    assert(vertices.some((p) => !p.equalTo(vertices[0])));

    const hull = [vertices.reduce((p, q) => {
      if (p.x < q.x)
        return p;
      if (p.x > q.x)
        return q
      if (p.y < q.y)
        return p;
      return q;
    })];

    do {
      const last = hull[hull.length - 1];
      let next = vertices[0].equalTo(last) ? vertices[1] : vertices[0];
      for (let p of vertices) {
        if (p.leftTo(new Flatten.Line(last, next)))
          next = p;
      }
      hull.push(next);
      // TODO: This is numerically too unstable (and hangs sometimes.)
      if (hull.length > vertices.length + 1) {
        console.error("Convex Hull incorrect");
        break;
      }
    } while(!hull[hull.length - 1].equalTo(hull[0]));

    hull.pop();

    const polygon = new Flatten.Polygon();
    polygon.addFace(hull);
    return new Polygon(coordinateSystem, polygon);
  }

  public equalTo(rhs: Point, epsilon: number = 0): boolean {
    if (this.parent === rhs.parent)
      return Math.abs(this.x - rhs.x) <= epsilon && Math.abs(this.y - rhs.y) <= epsilon;
    return this.parent.embed(rhs).equalTo(this);
  }

  public translate(vector: Vector): Point {
    return new Point(this.parent, this.value.translate(this.parent.embed(vector).value));
  }

  public readonly parent: CoordinateSystem;
  public readonly value: Flatten.Point;
}
