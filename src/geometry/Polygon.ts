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

import findIndex from "lodash-es/findIndex";

import CoordinateSystem from "./CoordinateSystem";
import Point from "./Point";
import Box from "./Box";

export default class Polygon {
  public constructor(parent: CoordinateSystem, value: Point[][]);
  public constructor(parent: CoordinateSystem, value: Flatten.Polygon);
  public constructor(parent: CoordinateSystem, value: Flatten.Polygon | Point[][]) {
    this.parent = parent;
    if (value instanceof Flatten.Polygon) {
      this.value = value;
    } else if (value instanceof Array) {
      this.value = new Flatten.Polygon();
      for (const face of value) {
        this.value.addFace(face.map((point) => parent.embed(point).value));
      }
    } else {
      throw Error("Cannot create polygon from this data.");
    }
  }

  public get convexHull(): Polygon {
    return Polygon.convexHull(this.vertices);
  }

  // Compute the convex hull of the points (using the slow Jarvis march
  // algorithm.)
  public static convexHull(points: Point[]): Polygon {
    console.assert(points.length !== 0);

    const coordinateSystem = points[0].parent;

    const vertices = points.map((p) => coordinateSystem.embed(p).value);

    console.assert(vertices.some((p) => !p.equalTo(vertices[0])));

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

  // Return a bounding rectangle of minimal area. (The rectangle might not be
  // axis-aligned.)
  public get boundingRect(): Polygon {
    const hull = this.convexHull;

    let minArea = 1./0.;
    let minAreaRect = null;

    // Algorithm: The minimal bounding rect of a convex polygon must be aligned to one of its sides.
    for (const edge of hull.value.edges) {
      // Rotate such that the edge is horizontal.
      const segment: Flatten.Segment = edge.shape;
      const direction = segment.tangentInStart();
      const theta = new Flatten.Vector(1, 0).angleTo(direction);
      const rotation = new Flatten.Matrix(
        Math.cos(-theta), -Math.sin(-theta),
        Math.sin(-theta), Math.cos(-theta),
      );
      const aligned = hull.value.transform(rotation);

      // Compute the area of this bounding box.
      const area = aligned.area();

      if (area < minArea) {
        minArea = area;

        // Rotate the box back.
        minAreaRect = new Polygon(this.parent, new Flatten.Polygon(aligned.box.toPoints()).transform(CoordinateSystem.inverse(rotation)));
      }
    }

    return minAreaRect!;
  }

  // Return a bounding box of this polygon in its parent's coordinate system.
  public get box(): Box {
    return new Box(this.parent, this.value.box);
  }

  public get vertices(): Point[] {
    return this.value.vertices.map((vertex) => new Point(this.parent, vertex));
  }

  public get faces(): Point[][] {
    const faces = [...this.value.faces] as Flatten.Face[];
    return faces.map((face) => face.edges.map((edge) => new Point(this.parent, edge.start)));
  }

  public equalTo(rhs: Box, epsilon?: number): boolean;
  public equalTo(rhs: Polygon, epsilon?: number): boolean;
  public equalTo(rhs: Box | Polygon, epsilon: number = 0): boolean {
    if (rhs instanceof Polygon) {
      const lfaces = this.faces;
      const rfaces = rhs.faces;

      if (lfaces.length !== rfaces.length)
        return false;

      const equalTo = (lface: Point[], rface: Point[]) => {
        if (lface.length !== rface.length)
          return false;
        for (let rot = 0; rot < lface.length; rot++) {
          if ([...lface.keys()].every((i) => lface[i].equalTo(rface[(i + rot) % rface.length], epsilon)))
            return true;
        }
        return false;
      };

      for (const lface of lfaces) {
        const rindex = findIndex(rfaces, (rface) => equalTo(lface, rface));
        if (rindex === -1)
          return false;
        rfaces.splice(rindex, 1);
      }

      return true;
    } else {
      const points = rhs.toPoints();
      if (this.parent.positive === rhs.parent.positive)
        points.reverse();
      return this.equalTo(new Polygon(this.parent, [points]), epsilon);
    }
  }

  public area(): number {
    return this.value.area();
  }
  
  public readonly parent: CoordinateSystem;
  public readonly value: Flatten.Polygon;
}
