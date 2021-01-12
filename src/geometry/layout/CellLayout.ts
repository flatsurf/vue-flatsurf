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
import minBy from "lodash-es/minBy";
import Flatten from "@flatten-js/core";

import Vector from "../Vector";
import HalfEdge from "../triangulation/HalfEdge";
import HalfEdgeLayout from './HalfEdgeLayout';
import Point from '../Point';
import Segment from '../Segment';
import Polygon from '../Polygon';
import FlatTriangulation from '../triangulation/FlatTriangulation';

export default class CellLayout {
  // Create a layout by walking the boundary of the cell in counter-clockwise
  // order on the inside and summing up the associated vectors to determine the
  // segment corresponding to each half edge.
  public constructor(surface: FlatTriangulation, cell: HalfEdge[], origin: Point);
  public constructor(surface: FlatTriangulation, layout: Record<HalfEdge, HalfEdgeLayout>);
  public constructor(surface: FlatTriangulation, cell: HalfEdge[] | Record<HalfEdge, HalfEdgeLayout>, origin?: Point) {
    this.surface = surface;

    if (cell instanceof Array) {
      assert(origin);
      let end = origin;
      this.layout = Object.fromEntries(cell.map((he: HalfEdge) => {
        const start = end;
        end = end.translate(new Vector(origin.parent, surface.vector(he)));
        return [he, {
          segment: new Segment(origin.parent, start.value, end.value),
          inner: false,
        }];
      }));
    } else {
      this.layout = cell;
    }
  }

  // Translate this cell so that half edge coincides with segment.
  translate(halfEdge: HalfEdge, segment: Segment): void {
    const before = this.layout[halfEdge].segment;
    const delta = new Vector(before.parent, before.start, segment.start);
    
    // https://github.com/alexbol99/flatten-js/pull/75
    assert(before.translate(delta).equalTo(segment, (Flatten.Utils as any).getTolerance()));
    
    this.halfEdges.map((halfEdge) => {
      this.layout[halfEdge].segment = this.layout[halfEdge].segment.translate(delta);
    });
  }

  // Return the half edges of this cell that overlap parts of the other cell.
  overlaps(other: CellLayout): HalfEdge[] {
    // TODO: Test this explicitly.
    const otherPolygon = other.polygon;
    return this.halfEdges.filter((halfEdge) => {
      return this.layout[halfEdge].segment.intersect(otherPolygon) && !this.layout[halfEdge].segment.touch(otherPolygon);
    });
  }

  // Return the boundary polygon of this cell (might not be connected.)
  get polygon(): Polygon {
    const polygon = new Flatten.Polygon();
    this.boundaries.map((boundary) => {
      polygon.addFace(boundary.map((side) => this.parent.embed(this.layout[side].segment).value));
    });
    return new Polygon(this.parent, polygon);
  }

  // Return the boundary polygons of this cell.
  get boundaries() : HalfEdge[][] {
    let pending = new Set(this.halfEdges.filter((he) => !this.layout[he].inner));
    const boundaries = [] as HalfEdge[][];

    while(pending.size) {
      let start!: number;
      for (start of pending) break;

      const boundary = [] as HalfEdge[];
      let next = start;
      do {
        next = -next;

        do {
          next = this.surface.vertices.preimage(next);
        } while(this.layout[next].inner);

        boundary.push(next);
        pending.delete(next);
      } while (next !== start);

      boundaries.push(boundary);
    }

    return boundaries;
  }

  private get parent() {
    return this.layout[this.halfEdges[0]].segment.parent;
  }

  get halfEdges(): HalfEdge[] {
    return Object.keys(this.layout).map((halfEdge) => Number(halfEdge));
  }

  // Merge two of the cells by identifying two opposite half edges.
  static merge(cells: CellLayout[]): CellLayout[] {
    if (cells.length === 1)
      return cells;

    let scores = [] as {
      glue: HalfEdge;
      cell: CellLayout;
      other: CellLayout;
      score: number;
    }[];

    for (const cell of cells) {
      for (const glue of cell.halfEdges) {
        if (glue < 0) continue;
        const other = cells.find((other) => other.halfEdges.includes(-glue))!;
        if (cell === other) continue;
        const score = CellLayout.score(glue, cell, other, cells);

        if (score === null)
          continue;

        scores.push({ glue, cell, other, score });
      }
    }

    if (scores.length === 0)
      return cells;

    const best = minBy(scores, 'score')!;

    const cell = CellLayout.glue(best.glue, best.cell, best.other);

    return [cell, ...cells.filter((c) => c !== best.cell && c !== best.other)];
  }

  // Return the score (lower is better) to the visual glueing of glue of
  // parent and -glue of other; or return null if the two cannot be glued
  // without overlaps in the resulting picture.
  private static score(glue: HalfEdge, parent: CellLayout, other: CellLayout, cells: CellLayout[]): number | null {
    assert(parent.halfEdges.includes(glue) && other.halfEdges.includes(-glue));
    assert(!parent.layout[glue].inner && !other.layout[-glue].inner);

    other.translate(-glue, parent.layout[glue].segment.reverse());
    if (parent.overlaps(other).length !== 0)
      return null;

    // Prefer edges that keep Delaunay cells intact.
    const ca = parent.surface.vector(glue);
    const cb = parent.surface.vector(parent.surface.vertices.image(glue));
    const dc = parent.surface.vector(-parent.surface.faces.image(-glue));

    const a = dc.add(ca);
    const b = dc.add(cb);
    const c = dc;

    const det = (x00: number, x01: number, x02: number, x10: number, x11: number, x12: number, x20: number, x21: number, x22: number) => x00 * (x11 * x22 - x12 * x21) - x10 * (x01 * x22 - x21 * x02) + x20 * (x01 * x12 - x11 * x02);

    const delaunay = det(a.x, a.y, a.x * a.x + a.y * a.y, b.x, b.y, b.x * b.x + b.y * b.y, c.x, c.y, c.x * c.x + c.y * c.y);

    console.log(delaunay);

    if (Math.abs(delaunay) < (Flatten.Utils as any).getTolerance())
      return -1/0;

    // Prefer edges that minimize the area of a bounding rectangle of the glued area.
    const ungluedArea = cells.map((cell) => cell.polygon.boundingRect.area()).reduce((a, b) => a+b);

    const gluedArea = cells.filter((cell) => cell !== parent && cell !== other).map((cell) => cell.polygon.boundingRect.area()).reduce((a, b) => a + b, 0)
      + CellLayout.glue(glue, parent, other).polygon.boundingRect.area();

    return gluedArea / ungluedArea;
  }

  // Glue parent and other along glue and return the resulting cell.
  private static glue(glue: HalfEdge, parent: CellLayout, other: CellLayout): CellLayout {
    other.translate(-glue, parent.layout[glue].segment.reverse());

    // https://github.com/alexbol99/flatten-js/pull/75
    assert(parent.layout[glue].segment.equalTo(other.layout[-glue].segment.reverse(), (Flatten.Utils as any).getTolerance()));

    assert(Object.keys(parent.layout).every((he) => !other.layout.hasOwnProperty(he)));
    assert(Object.keys(other.layout).every((he) => !parent.layout.hasOwnProperty(he)));

    return new CellLayout(parent.surface, {...parent.layout, ...other.layout, [glue]: { segment: parent.layout[glue].segment, inner: true }, [-glue]: { segment: other.layout[-glue].segment, inner: true }});
  }

  static pack(cells: CellLayout[]): CellLayout[] {
    return cells;
  }

  protected readonly surface: FlatTriangulation;
  public readonly layout: Record<HalfEdge, HalfEdgeLayout>;
}
