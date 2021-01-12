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

import xor from "lodash-es/xor";
import Flatten from "@flatten-js/core";

import HalfEdge from "./HalfEdge";
import Permutation from "./Permutation";

export default class FlatTriangulation {
  public static parse(yaml: {
    vertices: Array<HalfEdge[]>,
    vectors: { [key: number]: { x: number, y: number } }
  }) : FlatTriangulation {
    return new FlatTriangulation(
      Permutation.fromCycles(yaml.vertices),
      Object.fromEntries(Object.entries(yaml.vectors).map(([halfEdge, vector]) => [halfEdge, new Flatten.Vector(vector.x, vector.y)]))
    );
  }

  private constructor(vertices: Permutation<HalfEdge>, vectors: {[key: string]: Flatten.Vector}) {
    this.vertices = vertices;
    this.halfEdges = vertices.domain;
    this.faces = Permutation.fromMapping(this.halfEdges.map((he) => [-this.vertices.image(he), he]));

    this.vectors = vectors;

    if (xor(
      [...Object.keys(this.vectors), ...Object.keys(this.vectors).map((he) => String(-Number(he)))],
      this.halfEdges.map((he) => String(he))
    ).length !== 0)
      throw Error(`Provided vectors {${Object.keys(this.vectors)}} and present half edges {${this.halfEdges}} do not coincide.`);

    for (const face of this.faces.cycles) {
      if (!face.reduce((sum, he) => sum.translate(this.vector(he)), new Flatten.Point()).equalTo(new Flatten.Point(0, 0)))
        throw Error(`Face ${face} is not closed.`);
    }
  }

  public vector(halfEdge: HalfEdge): Flatten.Vector {
    return this.vectors[halfEdge] || this.vectors[-halfEdge].invert();
  }

  public readonly vertices: Permutation<HalfEdge>;
  public readonly halfEdges : HalfEdge[];
  public readonly faces : Permutation<HalfEdge>;
  private readonly vectors : {[key: string]: Flatten.Vector };
}
