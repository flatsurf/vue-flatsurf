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

import minBy from "lodash-es/minBy";

export default class Polygon {
  public constructor(parent: CoordinateSystem, value: Flatten.Polygon) {
    this.parent = parent;
    this.value = value;
  }

  public get convexHull(): Polygon {
    return Point.convexHull(this.value.vertices.map((vertex) => new Point(this.parent, vertex)));
  }

  // Return a bounding rectangle of minimal area. (The rectangle might not be
  // axis-aligned.)
  public get boundingRect(): Polygon {
    const hull = this.convexHull;

    // Algorithm: The minimal bounding rect of a convex polygon must be aligned to one of its sides.
    const rects = [...hull.value.edges].map((edge) => {
      // Rotate such that the edge is horizontal.
      const segment: Flatten.Segment = edge.shape;
      const direction = new Flatten.Vector(segment.pe.x - segment.ps.x, segment.pe.y - segment.ps.y);
      const theta = new Flatten.Vector(1, 0).angleTo(direction);
      const rotation = new Flatten.Matrix(
        Math.cos(-theta), -Math.sin(-theta),
        Math.sin(-theta), Math.cos(-theta),
      );
      const aligned = hull.value.transform(rotation);

      // Construct the bounding box.
      const box = aligned.box;

      // Rotate the box back.
      return new Polygon(this.parent, new Flatten.Polygon(box.toPoints()).transform(CoordinateSystem.inverse(rotation)));
    });

    return minBy(rects, (rect) => rect.area())!;
  }

  public area(): number {
    return this.value.area();
  }
  
  public readonly parent: CoordinateSystem;
  public readonly value: Flatten.Polygon;
}
