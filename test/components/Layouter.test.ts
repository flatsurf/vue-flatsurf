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

import { expect, describe, it } from "vitest"
import { mount, flushPromises } from '@vue/test-utils'
import Layouter from "@/components/Layouter";
import Layout from "@/layout/Layout";
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import {torus} from "@/../test/geometry/triangulation/FlatTriangulation.test";

describe("Layouter", () => {
  it("computes a layout", async () => {
    const layout: Layout = await new Promise((resolve) =>
      mount({
        template: "<layouter :triangulation='triangulation' @layout='onLayout' />",
        components: {Layouter},
        data() {
          return {
            triangulation: FlatTriangulation.parse(torus, CoordinateSystem.make(true, "Flatsurf Coordinate System")),
            onLayout: (layout: Layout) => {
              resolve(layout)
            }
          };
        },
      })
    );
    
    expect(layout.triangulation.vertices.cycles).to.eql(torus.vertices);
  });
});
