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

import YAML from "yaml";

import { chai, expect, describe, it } from "vitest";
import chaiEquals from "../chai-equal-to";
import { mount } from '@vue/test-utils'
import Widget from "@/components/Widget.vue";
import {torus} from "@/../test/geometry/triangulation/FlatTriangulation.test";
import IWidget from "@/components/IWidget";

chai.use(chaiEquals);

describe("Widget", () => {
  it("can export an SVG", async () => {
    const widget = mount(Widget, {
      propsData: {
        triangulation: YAML.stringify(torus),
      },
    });
    const svg = await (widget.vm as unknown as IWidget).svg();
    expect(svg).to.be.equal(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><g fill="#E0FFFF" fill-opacity=".5"><path d="M80 480 560 0H80zM560 480V0L80 480z"/></g><text font-size="75%" font-weight="700" text-anchor="end" transform="translate(326 16)">B</text><path stroke="#D1D1D1" stroke-width="2" d="M560 0H80"/><text font-size="75%" font-weight="700" text-anchor="end" transform="translate(554 244)">A</text><path stroke="#D1D1D1" stroke-width="2" d="M560 480V0"/><text font-size="75%" font-weight="700" text-anchor="end" transform="translate(98 244)">A</text><path stroke="#D1D1D1" stroke-width="2" d="M80 0v480"/><text font-size="75%" font-weight="700" text-anchor="end" transform="translate(326 472)">B</text><path stroke="#D1D1D1" stroke-width="2" d="M80 480h480"/><text font-size="75%" font-weight="700" text-anchor="end" transform="translate(317.515 235.515)">3</text><path stroke="#DDD" stroke-dasharray="8 6" stroke-width="2" d="M80 480 560 0"/></svg>`);
  });

  it("can export a trivial path drawing", async () => {
    const widget = mount(Widget, {
      propsData: {
        triangulation: YAML.stringify(torus),
        action: "path",
      },
    });

    const path = await (widget.vm as unknown as IWidget).path("now");
    expect(path).eql([]);

    // This test is only important to make the converse test below meaningful.
    await expect((widget.vm as unknown as IWidget).path("now")).resolves.toBe(path);

    widget.setProps({action: null});
    await widget.vm.$nextTick();

    await expect((widget.vm as unknown as IWidget).path("now")).rejects.toThrow();

    widget.setProps({action: "path"});
    await widget.vm.$nextTick();

    await expect((widget.vm as unknown as IWidget).path("now")).resolves.not.toBe(path);
  });
});