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
import partition from "lodash-es/partition";
import zipObject from "lodash-es/zipObject";
import mapValues from "lodash-es/mapValues";

import HalfEdge from "./HalfEdge";
import Edge from "./Edge";
import Permutation from "./Permutation";

import Vector, { VectorSchema } from "@/geometry/Vector";
import Point from "@/geometry/Point";
import CoordinateSystem from '@/geometry/CoordinateSystem';
import Vertex from "./Vertex";

export interface FlatTriangulationSchema {
  vertices: Array<HalfEdge[]>,
  vectors: { [key: number]: VectorSchema }
};

export default class FlatTriangulation {
  public static parse(raw: string, coordinateSystem: CoordinateSystem) : FlatTriangulation;
  public static parse(yaml: FlatTriangulationSchema, coordinateSystem: CoordinateSystem) : FlatTriangulation;
  public static parse(data: FlatTriangulationSchema | string, coordinateSystem: CoordinateSystem) : FlatTriangulation {
    if (typeof data === "string") {
      const pattern = /^FlatTriangulationCombinatorial\(vertices = (.*), faces = .*\) with vectors \{(.*)\}$/;
      const match = data.match(pattern);

      if (match === null)
        throw Error(`FlatTriangulation description does not match expected pattern ${pattern}`);

      const parseNumber = (x: string) => {
        console.log(x);
        if (x.match(/ ~ /)) {
          return Number(x.split(/ ~ /)[1]);
        } else {
          return Number(x);
        }
      };

      return new FlatTriangulation(
        Permutation.parse(match[1]),
        mapValues(
        zipObject(
          ...partition(match[2].substring(0, match[2].length - 1).split(/(?:: \()|(?:\), )/),
          (v: string) => !v.match(/,/)) as [string[], string[]]
        ), xy => Vector.parse(zipObject(['x', 'y'], xy.split(/, /).map(parseNumber)) as unknown as VectorSchema, coordinateSystem)));
    } else {
      return new FlatTriangulation(
        Permutation.fromCycles(data.vertices),
        Object.fromEntries(Object.entries(data.vectors).map(([halfEdge, vector]) => [halfEdge, Vector.parse(vector, coordinateSystem)]))
      );
    }
  }

  private constructor(vertices: Permutation<HalfEdge>, vectors: {[key: string]: Vector}) {
    this.vertices = vertices;
    this.vertexes = Vertex.fromPermutation(vertices);
    this.halfEdges = vertices.domain;
    this.edges = this.halfEdges.filter((halfEdge) => halfEdge > 0).map((halfEdge) => new Edge(halfEdge));
    this.faces = Permutation.fromMapping(this.halfEdges.map((he) => [-vertices.image(he), he]));

    this.vectors = vectors;

    if (xor(
      [...Object.keys(this.vectors), ...Object.keys(this.vectors).map((he) => String(-Number(he)))],
      this.halfEdges.map((he) => String(he))
    ).length !== 0)
      throw Error(`Provided vectors {${Object.keys(this.vectors)}} and present half edges {${this.halfEdges}} do not coincide.`);

    const coordinateSystem = this.coordinateSystem;

    for (const face of this.faces.cycles) {
      const sum = face.reduce((sum, he) => sum.translate(this.vector(he)), new Point(coordinateSystem, 0, 0));
      if (!sum.equalTo(new Point(coordinateSystem, 0, 0), 1e-6))
        throw Error(`Face ${face} is not closed. Going around the face gives (${sum.x}, ${sum.y}) but should be zero.`);
      // TODO: Wiggle the half edges to a place to make the faces closed in double coordinates. See https://github.com/flatsurf/vue-flatsurf/issues/38.
    }
  }

  public get coordinateSystem() : CoordinateSystem {
    if (Object.keys(this.vectors).length === 0)
      throw Error("Cannot determine coordinate system for empty surface.");
    return Object.values(this.vectors)[0].parent;
  }

  public vector(halfEdge: HalfEdge): Vector {
    return this.vectors[halfEdge] || this.vectors[-halfEdge].invert();
  }

  public readonly vertices: Permutation<HalfEdge>;
  public readonly vertexes: Vertex[];
  public readonly halfEdges : HalfEdge[];
  public readonly edges: Edge[];
  public readonly faces : Permutation<HalfEdge>;
  private readonly vectors : {[key: string]: Vector };
}
