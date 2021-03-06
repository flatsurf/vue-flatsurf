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

import chai, { expect } from "chai";
import chaiEquals from "../chai-equal-to";
import { mount } from '@vue/test-utils'
import Layouter from "@/components/Layouter";
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import {torus} from "@/../test/geometry/triangulation/FlatTriangulation.test";
import Layout from "@/layout/Layout";

chai.use(chaiEquals);

describe("Layouter", () => {
  it("computes a layout", async () => {
    const layouter = mount(Layouter, {
      propsData: {
        triangulation: FlatTriangulation.parse(torus, new CoordinateSystem(true)),
      }
    });
    const layout: Layout = await new Promise((resolve) => {
      layouter.vm.$on("layout", (layout: Layout) => resolve(layout))
    });
    expect(layout.triangulation.vertices.cycles).to.eql(torus.vertices);
  });
});
