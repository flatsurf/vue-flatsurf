/* ******************************************************************************
 * Copyright (c) 2021 Julian Rüth <julian.rueth@fsfe.org>
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

import HalfEdge from "@/flatsurf/HalfEdge";

// A (start or end) point on the path, given by the vertex at the start of these half edges.
export type VertexPoint = {
  vertex: HalfEdge[];
};

// A point on the path that is on the interior of a half edge.
export type HalfEdgePoint = {
  halfEdge: HalfEdge,
  // The relative position on the half edge in [0, 1].
  at: number;
};

// A point on the path that is on the interior of a face.
export type FacePoint = {
  // The boundary of the face.
  face: HalfEdge[],
  // The relative position in the face in the coordinate system given by two half edges on the face.
  at: [number, number],
};

// A point on the path.
export type PathPoint = VertexPoint | HalfEdgePoint | FacePoint;

export default interface IPathInteraction {
  query(when: "now" | "completed" | "changed"): Promise<PathPoint[]>;
}
