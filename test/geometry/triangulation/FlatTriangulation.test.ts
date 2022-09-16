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

import chai from "chai";
import "chai/register-should";
import chaiEquals from "../../chai-equal-to";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import Vector from "@/geometry/Vector";
import CoordinateSystem from '@/geometry/CoordinateSystem';

chai.use(chaiEquals);

export const torus = {
  vertices: [[3, 2, -1, -3, -2, 1]],
  vectors: {
    1: { x: 1, y: 0 },
    2: { x: 0, y: 1 },
    3: { x: 1, y: 1 }
  }
};

const quadrilateral = {
  triangulation: `
    FlatTriangulationCombinatorial(vertices = (1, 8, -7,
    9, -3, 10, -9, 11, -2, 12, -11, 7)(-1, -8, 6, -5, 3, -10, 5, -4, 2, -12, 4, -
    6), faces = (1, -6, -8)(-1, 7, 8)(2, 11, 12)(-2, -4, -12)(3, 9, 10)(-3, -5, -
    10)(4, 5, 6)(-7, -11, -9)) with vectors {1: (1, 0), 2: ((1/2 ~ 0.50000000), -
    (1/2*x ~ 0.86602540)), 3: ((1/2 ~ 0.50000000), (1/2*x ~ 0.86602540)), 4: ((3/
    2 ~ 1.5000000)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)p-62),
    (1/2*x ~ 0.86602540)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)p-
    62)), 5: (-(3/2 ~ 1.5000000)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.
    303644…)p-62), (1/2*x ~ 0.86602540)*ℝ(2.00114=9228629358915783047p-62 +
    ℝ(0.303644…)p-62)), 6: (0, -(x ~ 1.7320508)*ℝ(2.00114=
    9228629358915783047p-62 + ℝ(0.303644…)p-62)), 7: (0, -(x ~ 1.7320508)*ℝ
    (2.00114=9228629358915783047p-62 + ℝ(0.303644…)p-62)), 8: (1, (x ~ 1.
    7320508)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)p-62)), 9: (-
    (3/2 ~ 1.5000000)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)p-62)
    , (1/2*x ~ 0.86602540)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)
    p-62)), 10: ((3/2 ~ 1.5000000)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.
    303644…)p-62) - (1/2 ~ 0.50000000), -(1/2*x ~ 0.86602540) - (1/2*x ~ 0.
    86602540)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)p-62)), 11: (
    (3/2 ~ 1.5000000)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)p-62)
    , (1/2*x ~ 0.86602540)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)
    p-62)), 12: (-(1/2 ~ 0.50000000) - (3/2 ~ 1.5000000)*ℝ(2.00114=
    9228629358915783047p-62 + ℝ(0.303644…)p-62), (1/2*x ~ 0.86602540) - (1/2*
    x ~ 0.86602540)*ℝ(2.00114=9228629358915783047p-62 + ℝ(0.303644…)p-62))}`
};

describe("Flat Triangulation", () => {
  it("can be parsed from YAML output", () => {
    const coordinateSystem = new CoordinateSystem(true);
    const surface = FlatTriangulation.parse(torus, coordinateSystem);

    surface.vertices.cycles.should.eql([[3, 2, -1, -3, -2, 1]]);
    surface.faces.cycles.should.eql([[ -2, 3, -1 ], [ 1, 2, -3 ]]);
    surface.halfEdges.should.eql([3, -1, 2, -3, -2, 1]);

    surface.vector(1).should.equalTo(new Vector(coordinateSystem, 1, 0));
    surface.vector(-1).should.equalTo(new Vector(coordinateSystem, -1, 0));
  });

  it("can be parsed from string output", () => {
    const coordinateSystem = new CoordinateSystem(true);
    const surface = FlatTriangulation.parse(quadrilateral.triangulation, coordinateSystem);

    surface.vertices.cycles.should.eql([[1, 8, -7, 9, -3, 10, -9, 11, -2, 12, -11, 7], [-1, -8, 6, -5, 3, -10, 5, -4, 2, -12, 4, -6]]);
  });
});
