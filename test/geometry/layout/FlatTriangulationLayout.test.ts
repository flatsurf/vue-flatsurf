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

import FlatTriangulation from "@/geometry/triangulation/FlatTriangulation";
import FlatTriangulationLayout from "@/geometry/layout/FlatTriangulationLayout";
import CoordinateSystem from '@/geometry/CoordinateSystem';

chai.use(chaiEquals);

describe("Layout Triangulation", () => {
  const coordinateSystem = new CoordinateSystem(true);
  const torus = FlatTriangulation.parse({
    vertices: [[3, 2, -1, -3, -2, 1]],
    vectors: {
      1: { x: 1, y: 0 },
      2: { x: 0, y: 1 },
      3: { x: 1, y: 1 }
    }
  }, coordinateSystem);

  describe("Layout for a Torus", async () => {
    const layout = await FlatTriangulationLayout.layout(torus, []);

    it("lays out all half edges", () => {
      for (const he of torus.halfEdges) {
        layout.layout(he).should.not.be.null;
      }
    });

    it("has exactly one pair of half edges identified in the planar layout", () => {
      layout.layout(1).inner.should.be.false;
      layout.layout(2).inner.should.be.false;
      // Namely the diagonal edge is identified since it minimizes the
      // bounding  box of the layout.
      layout.layout(3).inner.should.be.true;
    });
  });
});
