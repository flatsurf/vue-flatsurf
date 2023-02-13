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

import {chai, expect, describe, it} from "vitest";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Viewport from "@/geometry/Viewport";
import Box from "@/geometry/Box";
import Point from "@/geometry/Point";
import chaiEquals from "../chai-equal-to";
import Vector from "@/geometry/Vector";

chai.use(chaiEquals);

describe("CoordinateSystem", () => {
  describe("a negative SVG coordinate system embedded into an ideal positive coordinate system such that (0, 0) are identified", () => {
    const ideal = CoordinateSystem.make(true, "Ideal Coordinate System");
    const svg = CoordinateSystem.make(false, "SVG Coordinate System");

    svg.embedInto(ideal);

    it("converts coordinates correctly", () => {
      expect(new Point(svg, 0, 0)).to.be.equalTo(new Point(svg, 0, 0));
      expect(new Point(svg, 0, 0)).to.be.equalTo(new Point(ideal, 0, 0));
      expect(new Point(svg, 1, 0)).to.be.equalTo(new Point(ideal, 1, 0));
      expect(new Point(svg, 0, 1)).to.be.equalTo(new Point(ideal, 0, -1));
    });
  });
});

describe("Viewport", () => {
  const ideal = CoordinateSystem.make(true, "Ideal Coordinate System");

  const viewport = new Viewport(ideal, 1024, 768);
  const box = new Box(ideal, [0, 0], [1, 1]);

  const EPS = .01;

  it("focuses correctly on a rectangular area bounded by (0, 0) and (1, 1) in an ideal positive coordinate system.", () => {
    viewport.focus(box);

    // The box from (0, 0) to (1, 1) is stretched to size 768 by 768 and
    // centered in the viewport (similar to object-fit: contain in CSS.)
    expect(viewport.embed(box)).to.be.equalTo(new Box(viewport.viewportCoordinateSystem, [(1024 - 768) / 2, 768], [768 + (1024 - 768) / 2, 0]), EPS)
  });

  it("when resizing the viewport, the focused box remains centered", () => {
    // The box from (0, 0) to (1, 1) is again stretched to size 768 by 768
    // and centered in the viewport (similar to object-fit: contain in CSS.)
    viewport.resize(768, 1024);
    expect(viewport.embed(box)).to.be.equalTo(new Box(viewport.viewportCoordinateSystem, [0, 768 + (1024 - 768) / 2], [768, (1024 - 768) / 2]), EPS);

    // The box from (0, 0) to (1, 1) is stretched to size 1024 by 1024.
    viewport.resize(1024, 1024);
    expect(viewport.embed(box)).to.be.equalTo(new Box(viewport.viewportCoordinateSystem, [0, 1024], [1024, 0]), EPS);

    // Focusing exactly the visible box does not change what's shown.
    viewport.focus(viewport.viewport);
    expect(viewport.embed(box)).to.be.equalTo(new Box(viewport.viewportCoordinateSystem, [0, 1024], [1024, 0]), EPS);
  });

  it("when shifting the viewport, the content moves in the opposite direction", () => {
    // We shift the viewport to the left which makes the content move to the right.
    viewport.focus(viewport.viewport.translate(new Vector(viewport.viewportCoordinateSystem, -1024, 0)));
    expect(viewport.embed(box)).to.be.equalTo(new Box(viewport.viewportCoordinateSystem, [1024, 1024], [2048, 0]), EPS);
  });

  it("zooms in and out of the center", () => {
    viewport.focus(box);
    expect(viewport.viewport).to.be.equalTo(new Box(ideal, [0, 0], [1, 1]), EPS);
    viewport.zoom(2.0);
    expect(viewport.viewport).to.be.equalTo(new Box(ideal, [.25, .25], [.75, .75]), EPS);
    viewport.zoom(0.5);
    expect(viewport.viewport).to.be.equalTo(new Box(ideal, [0, 0], [1, 1]), EPS);
  });

  it("zooms in and out of another point such that the position of that point is unchanged", () => {
    viewport.focus(box);

    let visible = ideal.embed(viewport.viewport).box;
    expect([visible.width, visible.height]).to.eql([box.width, box.height]);

    const centers = [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.5, 1.0], [2.5, 3.0]];

    for (let [x, y] of centers) {
      const center = new Point(ideal, x, y);
      const centerBefore = viewport.viewportCoordinateSystem.embed(center);

      viewport.zoom(2.0, center);

      // The position of the center of the zoom has not moved in the viewport.
      const centerZoomed = viewport.viewportCoordinateSystem.embed(center);
      expect([centerZoomed.x, centerZoomed.y]).to.eql([centerBefore.x, centerBefore.y]);

      // Only a quarter of what was visible before is visible now.
      visible = ideal.embed(viewport.viewport).box;
      expect([visible.width, visible.height]).to.eql([box.width / 2, box.height / 2]);

      viewport.zoom(0.5, center);
      
      // The position of the center of the zoom has not moved in the viewport.
      const centerUnzoomed = viewport.viewportCoordinateSystem.embed(center);
      expect([centerUnzoomed.x, centerUnzoomed.y]).to.eql([centerBefore.x, centerBefore.y]);

      // The original content is visible again.
      visible = ideal.embed(viewport.viewport).box;
      expect(visible.width).to.equal(box.width);
      expect(visible.height).to.equal(box.height);
    }
  });
});