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

import HalfEdge from "./HalfEdge";

type HalfEdgeMap = { [preimage: number]: HalfEdge };

export interface AutomorphismSchema {
  halfEdges: HalfEdgeMap,
};

/*
 * An automorphism of a Flat Triangulation.
 */
export default class Automorphism {
  public static parse(yaml: AutomorphismSchema): Automorphism {
    return new Automorphism(yaml.halfEdges);
  }

  private constructor(halfEdges: HalfEdgeMap ) {
    const set = (preimage: HalfEdge, image: HalfEdge) => {
      if (halfEdges.hasOwnProperty(preimage))
        console.assert(halfEdges[preimage] === image);
      halfEdges[preimage] = image;
    };

    for (const [key, image] of Object.entries(halfEdges)) {
      const preimage = Number(key);
      set(-preimage, -image);
      set(image, preimage);
      set(-image, -preimage);
    }

    this.halfEdgeMap = halfEdges;
  }

  // The mapping of half edges under the automorphism.
  // This mapping might not contain all half edges if the automorphism is only
  // defined on the level of the Delaunay cells of the triangulation.
  public readonly halfEdgeMap: HalfEdgeMap;
}


