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
import Edge from "@/flatsurf/Edge";
import Automorphism from "@/flatsurf/Automorphism";

export default class LayoutOptions {
  public constructor(glue?: (edge: Edge) => boolean | null, automorphisms?: Automorphism[]) {
    this.glued = glue || (() => null);
    this.automorphisms = automorphisms || [];
  }

  // Whether an HalfEdge should be visually glued (true), unglued (false) or
  // whether this sholud be left to the implementation (null).
  public glue(halfEdge: HalfEdge): boolean | null {
    return this.glued(new Edge(halfEdge));
  }

  public orbit(halfEdge: HalfEdge): HalfEdge[] {
    const orbit = [halfEdge];

    for (let i = 0; i < orbit.length; i++) {
      const preimage = orbit[i];
      for (const automorphism of this.automorphisms) {
        const image = automorphism.halfEdgeMap[preimage];
        if (image != null && !orbit.includes(image))
          orbit.push(image);
      }
    }

    return orbit;
  }

  private readonly glued: (edge: Edge) => boolean | null;
  private readonly automorphisms: Automorphism[];
};
