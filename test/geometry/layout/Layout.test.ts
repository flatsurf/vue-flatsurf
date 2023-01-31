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

import { describe, it, chai, expect } from "vitest";
import chaiEquals from "../../chai-equal-to";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import Layout from "@/layout/Layout";
import CoordinateSystem from '@/geometry/CoordinateSystem';
import LayoutOptions from "@/layout/LayoutOptions";
import Edge from "@/flatsurf/Edge";

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

  describe("Default Layout for a Torus", () => {
    let layout!: Layout;

    it("computes a layout", async () => {
      layout = await Layout.layout(torus, new LayoutOptions());
    });

    it("lays out all half edges", () => {
      for (const he of torus.halfEdges) {
        expect(layout.layout(he)).not.to.be.null;
      }
    });

    it("has exactly one pair of half edges identified in the planar layout", () => {
      expect(layout.layout(1).inner).to.be.false;
      expect(layout.layout(2).inner).to.be.false;
      // Namely the diagonal edge is identified since it minimizes the
      // bounding  box of the layout.
      expect(layout.layout(3).inner).to.be.true;
    });
  });

  describe("Forced Layout for a Torus", () => {
    let layout!: Layout;

    it("computes a layout", async () => {
      layout = await Layout.layout(torus, new LayoutOptions(
        (edge: Edge) => {
          if (edge.positive === 1)
            return true;
          return null;
      }))
    });

    it("has exactly one pair of half edges identified in the planar layout", () => {
      expect(layout.layout(1).inner).to.be.true;
      expect(layout.layout(2).inner).to.be.false;
      expect(layout.layout(3).inner).to.be.false;
    });
  });

  describe("Forced Layout for a Torus Without any Gluings", () => {
    let layout!: Layout;

    it("computes a layout", async () => {
      layout = await Layout.layout(torus, new LayoutOptions(
        () => false
      ));
    });

    it("has no pair of half edges identified in the planar layout", () => {
      expect(layout.layout(1).inner).to.be.false;
      expect(layout.layout(2).inner).to.be.false;
      expect(layout.layout(3).inner).to.be.false;
    });
  });
});

describe("Layout of a Disconnected Surface", () => {
  const coordinateSystem = new CoordinateSystem(true);
  const disconnected = FlatTriangulation.parse({
    vertices: [[1, -3, 2, -1, 3, -2], [4, -5, 6, -4, 5, -6]],
    vectors: {
      1: { x: 1, y: 1 },
      2: { x: -1, y: 0 },
      3: { x: 0, y: -1 },
      4: { x: 1, y: 1 },
      5: { x: 0, y: -1 },
      6: { x: -1, y: 0 }
    },
  }, coordinateSystem);

  describe("Default Layout of a Disconnected Surface", () => {
    let layout!: Layout;

    it("computes a layout", async () => {
      layout = await Layout.layout(disconnected, new LayoutOptions());
    });

    it("lays out all half edges", () => {
      for (const he of disconnected.halfEdges) {
        expect(layout.layout(he)).not.to.be.null;
      }
    });
  });
});
