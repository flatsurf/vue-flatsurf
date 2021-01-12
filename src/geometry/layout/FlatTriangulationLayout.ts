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

import Point from '../Point';
import FlatTriangulation from "../triangulation/FlatTriangulation";
import HalfEdge from '../triangulation/HalfEdge';
import CellLayout from './CellLayout';
import HalfEdgeLayout from './HalfEdgeLayout';
import Box from '../Box';

export default class FlatTriangulationLayout {
  public constructor(surface: FlatTriangulation) {
    this.surface = surface;
    this.recompute();
  }

  private recompute() {
    // Layout Algorithm:
    // (1) Start from relatively elementary cells, e.g., Delaunay cells or
    //     simply triangular faces.
    // (2) Greedily glue any two cells as long as no overlap is produced,
    //     prefering the gluing that minimizes the area of a bounding
    //     rectangle.
    // (3) Pack the resulting cells into a box by randomly aligning
    //     corresponding half edges to create a single polygon (with self intersections)
    //     and move the pieces away from each other orthogonally until no overlaps
    //     happen anymore.

    // (1) Elementary Cells
    if (this.surface.halfEdges.length === 0) {
      this.halfEdges = {};
      return;
    }

    const origin = new Point(this.surface.vector(this.surface.halfEdges[0]).parent, 0, 0);
    let cells = this.surface.faces.cycles.map((face) => new CellLayout(this.surface, face, origin));

    // (2) Glue Cells
    for (const _ of Array(cells.length - 1))
      cells = CellLayout.merge(cells);

    // (3) Pack Cells
    cells = CellLayout.pack(cells);

    this.halfEdges = Object.assign({}, ...cells.map((cell) => cell.layout));
  }

  public layout(halfEdge: HalfEdge): HalfEdgeLayout {
    return this.halfEdges[halfEdge];
  }

  public get bbox(): Box {
    return Box.bbox(Object.values(this.halfEdges).map((layout) => layout.segment));
  }

  private readonly surface: FlatTriangulation;
  private halfEdges!: Record<HalfEdge, HalfEdgeLayout>;
}
