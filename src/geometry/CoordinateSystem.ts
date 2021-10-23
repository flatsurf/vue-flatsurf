/* ******************************************************************************
 * Copyright (c) 2020-2021 Julian Rüth <julian.rueth@fsfe.org>
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
import Polygon from "./Polygon";
import Box from "./Box";
import Vector from "./Vector";
import Segment from "./Segment";
import Line from "./Line";

export type Coordinate = number;

export default class CoordinateSystem {
  public constructor(positive: boolean) {
    this.positive = positive;
  }

  public static inverse(A: Flatten.Matrix) {
    const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = [A.a, A.c, A.tx, A.b, A.d, A.ty, 0, 0, 1];
    const adj = [a11*a22 - a21*a12, a10*a22 - a20*a12, a10*a21 - a20*a11, a01*a22 - a21*a02, a00*a22 - a20*a02, a00*a21 - a20*a01, a01*a12 - a11*a02, a00*a12 - a10*a02, a00*a11 - a10*a01];
    const det = a00*adj[0] - a01*adj[1] + a02*adj[2];
    const inv = [adj[0], -adj[3], adj[6], -adj[1], adj[4], -adj[7], adj[2], -adj[5], adj[8]].map(a => a / det);
    const affine = inv.map(a => a / inv[8]);
    return new Flatten.Matrix(affine[0], affine[3], affine[1], affine[4], affine[2], affine[5]);
  }

  public readonly positive: boolean;
  private embeddedInto: CoordinateSystem | null = null;
  private embedding: Flatten.Matrix | null = null;

  public embedInto(into: CoordinateSystem, embedding?: Flatten.Matrix) {
    if (embedding === undefined) {
      embedding = new Flatten.Matrix();
      if (this.positive !== into.positive)
        embedding = new Flatten.Matrix(1, 0, 0, -1);
    }
    if (this.embeddedInto !== null && this.embeddedInto !== into)
      console.warn("Coordinate system had already been embedded. Dropping previous embedding.");
    this.embeddedInto = into;
    this.embedding = embedding;
  }

  public box(xy0: [Coordinate, Coordinate], xy1: [Coordinate, Coordinate]) {
    return new Box(this, xy0, xy1);
  }

  public point(x: Coordinate, y: Coordinate) {
    return new Point(this, x, y);
  }

  public embed(box: Box): Polygon;
  public embed(point: Point): Point;
  public embed(vector: Vector): Vector;
  public embed(segment: Segment): Segment;
  public embed(line: Line): Line;
  public embed(polygon: Polygon): Polygon;
  public embed(value: Box | Point | Vector | Segment | Line | Polygon) : Point | Vector | Segment | Line | Polygon {
    if (value instanceof Box) {
      const polygon = new Flatten.Polygon();
      polygon.addFace(value.toPoints().map((point) => this.embed(point).value));
      return new Polygon(this, polygon);
    } else if (value instanceof Point) {
      let point = value as Point;
      while(true) {
        if (this === point.parent)
          return point;

        if (point.parent.embeddedInto === null)
          break;

        point = new Point(point.parent.embeddedInto,
          point.value.transform(point.parent.embedding!));
      }

      if (this.embeddedInto === null) {
        throw Error(`point (${point.value.x}, ${point.value.y}) cannot be embedded from coordinate system ${JSON.stringify(point.parent)} into this coordinate system ${JSON.stringify(this)}; no relation between the coordinate systems could be established.`)
      }

      point = this.embeddedInto.embed(point);

      return new Point(this, ...CoordinateSystem.inverse(this.embedding!).transform([point.x, point.y]));
    } else if (value instanceof Vector) {
      const point = this.embed(new Point(value.parent, value.x, value.y));
      const origin = this.embed(new Point(value.parent, 0, 0));
      return new Vector(this, point.x - origin.x, point.y - origin.y);
    } else if (value instanceof Segment) {
      return new Segment(this, this.embed(value.start).value, this.embed(value.end).value);
    } else if (value instanceof Line) {
      return new Line(this.embed(value.pt), this.embed(value.norm));
    } else if (value instanceof Polygon) {
      return new Polygon(this, new Flatten.Polygon(([...value.value.faces] as Flatten.Face[]).map((face) => (face.edges as Flatten.Edge[]).map((edge) => this.embed(new Point(value.parent, edge.start)).value))));
    }

    throw Error(`cannot embed this type of object into coordinate system yet`);
  }
}


