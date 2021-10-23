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

import Point from '@/geometry/Point';
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import HalfEdge from '@/flatsurf/HalfEdge';
import CellLayout from './CellLayout';
import HalfEdgeLayout from './HalfEdgeLayout';
import Box from '@/geometry/Box';
import Polygon from "@/geometry/Polygon";
import CancellationToken from "@/CancellationToken";
import Progress from "@/Progress";
import LayoutOptions from './LayoutOptions';

export default class Layout {
  private constructor(surface: FlatTriangulation, options: LayoutOptions) {
    this.surface = surface;
    this.options = options;
    this.primary = [];
  }

  public static async layout(surface: FlatTriangulation, options: LayoutOptions, cancellation = new CancellationToken(), progress = new Progress()) {
    const layout = new Layout(surface, options);
    await layout.recompute(cancellation, progress);
    return layout;
  }

  private async recompute(cancellation: CancellationToken, progress: Progress) {
    // Layout Algorithm:
    // (1) Start from elementary cells, i.e., triangular faces.
    // (2) Greedily glue any two cells as long as no overlap is produced,
    //     prefering metrics such as the gluing that minimizes the area of a
    //     bounding rectangle.
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
    progress.task("Gluing Cells", cells.length - 1);
    const cache = {};
    for (const _ of Array(cells.length - 1)) {
      progress.progress();
      cells = await CellLayout.merge(cells, this.options, cache, cancellation, progress);
    }

    // (3) Pack Cells
    cells = CellLayout.pack(cells.filter((cell) => cell.primary), progress);

    this.halfEdges = Object.assign({}, ...cells.map((cell) => cell.layout));
    this.primary = cells.filter((cell) => cell.primary).map((cell) => cell.halfEdges).flat();

    for (const he of this.surface.halfEdges) {
      if (this.options.glue(he) === true && !this.layout(he).inner)
        console.log(`Half edge ${he} should be visually glued in the layout but this was not possible.`);
      if (this.options.glue(he) === false && this.layout(he).inner)
        console.error(`Half edge ${he} should not be visually glued in the layout but it is.`);
    }
  }

  public layout(halfEdge: HalfEdge): HalfEdgeLayout & { primary: boolean } {
    return {
      ...this.halfEdges[halfEdge],
      primary: this.primary.includes(halfEdge),
    };
  }

  public get hull(): Polygon {
    return Polygon.convexHull(this.primary.map((halfEdge) => [this.halfEdges[halfEdge].segment.start, this.halfEdges[halfEdge].segment.end]).flat());
  }

  public get bbox(): Box {
    return Box.bbox(this.primary.map((halfEdge) => this.halfEdges[halfEdge].segment));
  }

  // TODO; Rename to triangulation.
  public readonly surface: FlatTriangulation;
  private readonly options: LayoutOptions;
  private halfEdges!: Record<HalfEdge, HalfEdgeLayout>;
  // Which half edges should be considered the primary copies of half edges
  // identified by the automorphisms.
  public primary!: HalfEdge[];
}
