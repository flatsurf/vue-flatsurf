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
import Progress from "@/Progress";
import CancellationToken from "@/CancellationToken";

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
        end = end.translate(surface.vector(he));
        return [he, {
          segment: new Segment(origin.parent, start.value, end.value),
          inner: false,
        }];
      }));
    } else {
      this.layout = cell;
    }

    this.boundingRectArea = this.polygon.boundingRect.area();
  }

  // Translate this cell so that half edge coincides with segment.
  translate(delta: Vector): void;
  translate(halfEdge: HalfEdge, segment: Segment): void;
  translate(halfEdge: HalfEdge | Vector, segment?: Segment) {
    if (halfEdge instanceof Vector) {
      const delta = halfEdge as Vector;
      this.halfEdges.map((halfEdge) => {
        this.layout[halfEdge].segment = this.layout[halfEdge].segment.translate(delta);
      });
    } else {
      const before = this.layout[halfEdge].segment;
      const delta = new Vector(before.parent, before.start, segment!.start);
      
      // https://github.com/alexbol99/flatten-js/pull/75
      assert(before.translate(delta).equalTo(segment!, (Flatten.Utils as any).getTolerance()));

      this.translate(delta);
    }
  }

  // Return the HalfEdges that glue correctly between this layout and `other`
  // currently or return an empty array if something overlaps or touches
  // incorrectly.
  glues(other: CellLayout): HalfEdge[] {
    const otherPolygon = other.polygon;

    const glued = [];

    for (const halfEdge of this.halfEdges) {
      if (this.layout[halfEdge].segment.intersects(otherPolygon)) {
        // This half edge and the other cell have at least a point in common.

        if (this.layout[halfEdge].segment.middle.on(otherPolygon)) {
          if (other.halfEdges.includes(-halfEdge)) {
            // If this half edge has its counterpart in the other cell, then we
            // want them to be glued correctly.
            if (this.layout[halfEdge].segment.equalTo(other.layout[-halfEdge].segment.reverse(), Flatten.Utils.getTolerance())) {
              glued.push(halfEdge);
              continue;
            } else {
              return [];
            }
          } else {
            return [];
          }
        }

        const intersections = this.layout[halfEdge].segment.intersect(otherPolygon);
        if (intersections.length === 0) {
          // This half edge is completely inside the other cell.
          return [];
        }

        // Check whether the intersection points are consistently glued.
        for (const intersection of intersections) {
          const touchConsistent = (source: HalfEdge) => {
              for (const vertex of this.surface.vertices.cycles) {
                if (!vertex.includes(source)) continue;

                for (const touch of vertex) {
                  if (!other.halfEdges.includes(touch)) continue;

                  if (intersection.equalTo(other.layout[touch].segment.start, Flatten.Utils.getTolerance()))
                    return true;
              }
            };
            // Not touching at a vertex or not touching at this vertex.
            return false;
          }

          if (intersection.equalTo(this.layout[halfEdge].segment.start, Flatten.Utils.getTolerance())) {
            // The cells touch at the starting point of this half edge. We
            // check whether what it touches is the same vertex in the other
            // cell.
            if (!touchConsistent(halfEdge)) {
              return [];
            }
          }
          else if (intersection.equalTo(this.layout[halfEdge].segment.end, Flatten.Utils.getTolerance())) {
            // The cells touch at the end point of this half edge. We
            // check whether what it touches is the same vertex in the other
            // cell.
            if (!touchConsistent(-halfEdge)) {
              return [];
            }
          } else {
            // The cells touch not at the end point of a half edge.
            return [];
          }
        }
      }
    }

    assert(glued.length !== 0);
    return glued;
  }

  touches(other: CellLayout): HalfEdge[] {
    const otherPolygon = other.polygon;
    return this.halfEdges.filter((halfEdge) => {
      return !this.layout[halfEdge].inner && this.layout[halfEdge].segment.intersects(otherPolygon) || this.layout[halfEdge].segment.touch(otherPolygon);
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

  public toString(): string {
    return "{" + this.halfEdges.map((he) => `${he}: ${this.layout[he].segment}`).join(", ") + "}";
  }

  get halfEdges(): HalfEdge[] {
    return Object.keys(this.layout).map((halfEdge) => Number(halfEdge));
  }

  // Merge two of the cells by identifying two opposite half edges.
  static async merge(cells: CellLayout[], force: (he: HalfEdge) => boolean | null, cache: Record<HalfEdge, number | null> = {}, cancellation = new CancellationToken(), _progress = new Progress()): Promise<CellLayout[]> {
    if (cells.length === 1)
      return cells;

    let scores = [] as {
      glue: HalfEdge;
      cell: CellLayout;
      other: CellLayout;
      score: number;
    }[];

    for (const cell of cells) {
      if (await cancellation.cancellationRequested())
        break;

      for (const glue of cell.halfEdges) {
        if (glue < 0) continue;
        const other = cells.find((other) => other.halfEdges.includes(-glue))!;
        if (cell === other) continue;

        if (cache[glue] === undefined) {
          cache[glue] = CellLayout.score(glue, cell, other, cells, force);
        }

        const score = cache[glue];

        if (score === null)
          continue;

        scores.push({ glue, cell, other, score });
      }
    }

    if (scores.length === 0)
      return cells;

    const best = minBy(scores, 'score')!;

    const cell = CellLayout.glue(best.glue, best.cell, best.other);

    for (let halfEdge of cell.halfEdges) {
      delete cache[halfEdge];
      delete cache[-halfEdge];
    }

    return [cell, ...cells.filter((c) => c !== best.cell && c !== best.other)];
  }

  // Return the score (lower is better) to the visual glueing of glue of
  // parent and -glue of other; or return null if the two cannot be glued
  // without overlaps in the resulting picture.
  private static score(glue: HalfEdge, parent: CellLayout, other: CellLayout, cells: CellLayout[], force?: (he: HalfEdge) => boolean | null): number | null {
    assert(parent.halfEdges.includes(glue) && other.halfEdges.includes(-glue));
    assert(!parent.layout[glue].inner && !other.layout[-glue].inner);

    other.translate(-glue, parent.layout[glue].segment.reverse());
    const glues = parent.glues(other);
    if (glues.length === 0) {
      return null;
    }


    // Prefer edges that have been explicitly selected.
    if (force) {
      if (force(glue) === true)
        return -force.length;
      if (force(glue) === false)
        return null;
    }

    // Prefer edges that keep Delaunay cells intact.
    {
      const ca = parent.surface.vector(glue);
      const cb = parent.surface.vector(parent.surface.vertices.image(glue));
      const dc = parent.surface.vector(-parent.surface.faces.image(-glue));

      const a = dc.add(ca);
      const b = dc.add(cb);
      const c = dc;

      const det = (x00: number, x01: number, x02: number, x10: number, x11: number, x12: number, x20: number, x21: number, x22: number) => x00 * (x11 * x22 - x12 * x21) - x10 * (x01 * x22 - x21 * x02) + x20 * (x01 * x12 - x11 * x02);

      const delaunay = det(a.x, a.y, a.x * a.x + a.y * a.y, b.x, b.y, b.x * b.x + b.y * b.y, c.x, c.y, c.x * c.x + c.y * c.y);

      if (Math.abs(delaunay) < (Flatten.Utils as any).getTolerance())
        return 0;
    }

    // Prefer edges that minimize the area of a bounding rectangle of the glued area.
    {
      const ungluedArea = cells.map((cell) => cell.boundingRectArea).reduce((a, b) => a+b);

      const gluedArea = cells.filter((cell) => cell !== parent && cell !== other).map((cell) => cell.boundingRectArea).reduce((a, b) => a + b, 0)
        + CellLayout.glue(glues, parent, other).boundingRectArea;

      return gluedArea / ungluedArea;
    }
  }

  // Glue parent and other along glue and return the resulting cell.
  private static glue(glues: HalfEdge[], parent: CellLayout, other: CellLayout): CellLayout;
  private static glue(glue: HalfEdge, parent: CellLayout, other: CellLayout): CellLayout;
  private static glue(glues: HalfEdge | HalfEdge[], parent: CellLayout, other: CellLayout): CellLayout {
    if (!Array.isArray(glues)) {
      other.translate(-glues, parent.layout[glues].segment.reverse());
      return CellLayout.glue(parent.glues(other), parent, other);
    } else {
      assert(glues.length !== 0)
      other.translate(-glues[0], parent.layout[glues[0]].segment.reverse());

      // https://github.com/alexbol99/flatten-js/pull/75
      for (const glue of glues)
        assert(parent.layout[glue].segment.equalTo(other.layout[-glue].segment.reverse(), (Flatten.Utils as any).getTolerance()));

      assert(Object.keys(parent.layout).every((he) => !other.layout.hasOwnProperty(he)));
      assert(Object.keys(other.layout).every((he) => !parent.layout.hasOwnProperty(he)));

      const glued = {...parent.layout, ...other.layout};
      for (const glue of glues) {
        glued[glue] = { segment: parent.layout[glue].segment, inner: true }
        glued[-glue] = { segment: other.layout[-glue].segment, inner: true }
      }

      return new CellLayout(parent.surface, glued);
    }
  }

  private static packable(cells: CellLayout[], packed: CellLayout[]) {
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      // Find a half edge that connects to something that has already been packed
      for (let halfEdge of cell.halfEdges) {
        for (let cell_ of packed) {
          for (let halfEdge_ of cell_.halfEdges) {
            if (halfEdge === -halfEdge_) {
              cells.splice(i, 1);
              return {
                cell,
                cell_,
                halfEdge,
                halfEdge_,
              };
            }
          }
        }
      }
    }

    assert(false, `Could not find any cells packable with ${packed} among ${cells}`);
  }

  static pack(cells: CellLayout[], progress: Progress): CellLayout[] {
    if (cells.length <= 1) return cells;

    const packed = [cells.pop()] as CellLayout[];

    progress.task("Packing Cells", cells.length);

    while (cells.length) {
      progress.progress();

      const {cell, cell_, halfEdge, halfEdge_} = CellLayout.packable(cells, packed);

      const segment = cell.layout[halfEdge].segment;
      const segment_ = cell_.layout[halfEdge_].segment.reverse();

      cell.translate(halfEdge, segment_);

      // We determine a distance that two edges have to be separated from each
      // other to make it clear that they are not glued.
      // The idea is that the entire `packed` presumably fills a notebook cell,
      // probably 800 x 600 pixels. A gap of 10 pixels (minus SVG borders) can
      // easily be recognized as a gap.
      const screen = packed.map((cell) => cell.polygon.value.box).reduce((box, cell) => box.merge(cell), new Flatten.Box());
      const step = Math.max((screen.xmax - screen.xmin) / 800, (screen.ymax - screen.ymin) / 600) * 10;
      const delta = segment.tangentInStart.rotate90CCW().multiply(step);
      
      do {
        cell.translate(delta);
      } while(packed.some((other) => cell.touches(other).length))

      packed.push(cell);
    }

    return packed;
  }

  protected readonly surface: FlatTriangulation;
  protected readonly boundingRectArea: number;
  public readonly layout: Record<HalfEdge, HalfEdgeLayout>;
}
