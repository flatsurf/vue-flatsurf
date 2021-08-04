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

import chai from "chai";
import "chai/register-should";
import chaiEquals from "../../test/chai-equal-to";
import SVGExporter from "@/export/SVGExporter";

chai.use(chaiEquals);

describe("SVG Export", () => {
  it("exports a trivial SVG", () => {
    document.write("<svg></svg>");
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"/>');
  });

  it("drops classes", () => {
    document.write("<svg><text class='class'>text</text></svg>");
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropClasses();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><text>text</text></svg>');
  });

  it("drops browser prefixed styling", () => {
    document.write("<svg><text style='-webkit-appearance: none;'>text</text></svg>");
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropPrefixedStyles();
    exporter.dropInvisible();
    exporter.inlineStyles();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><text>text</text></svg>');
  });

  it("drops invisible nodes", () => {
    document.write(`<svg>
      <text style="visibility: hidden">visibility: hidden</text>
      <text style="visibility: visible">visibility: visible</text>
      <text style="display: none">display: none</text>
      <text style="display: inline">display: inline</text>
    </svg>`);
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropInvisible();
    exporter.inlineStyles();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><text>visibility: visible</text><text>display: inline</text></svg>');
  });

  it("drops redundant styles", () => {
    document.write(`<svg>
      <g class="texts" style="color: red">
        <text style="color: red">red</text>
        <text style="color: blue">blue</text>
      </g>
    </svg>`);
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropRedundantStyles();
    exporter.dropInvisible();
    exporter.inlineStyles();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><g class="texts" style="color:red"><text>red</text><text style="color:#00f">blue</text></g></svg>');
  });

  it("drops custom attributes", () => {
    document.write(`<svg><text data-attribute="data">text</text></svg>`);
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropInvisible();
    exporter.dropCustomAttributes();
    exporter.inlineStyles();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><text>text</text></svg>');
  });

  it("drops browser styling", () => {
    document.write(`<svg><text style="flex-grow:1">text</text></svg>`);
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropInvisible();
    exporter.dropNonStandardStyles();
    exporter.inlineStyles();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><text>text</text></svg>');
  });

  it("drops interactive styling", () => {
    document.write(`<svg><text style="cursor:resize">text</text></svg>`);
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropInvisible();
    exporter.dropInteractiveStyles();
    exporter.inlineStyles();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><text>text</text></svg>');
  });

  it("rewrites unsupported color specifications", () => {
    document.write(`<svg><text style="stroke:rgba(128, 128, 128, .5)">text</text></svg>`);
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropInvisible();
    exporter.simplifyColors();
    exporter.inlineStyles();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><text style="stroke:gray;stroke-opacity:.5">text</text></svg>');
  });

  it("rewrites colors in presentation attributes", () => {
    document.write(`<svg><text style="stroke:rgba(128, 128, 128, .5)">text</text></svg>`);
    const exporter = new SVGExporter(document.getElementsByTagName("svg")[0]);
    exporter.dropInvisible();
    exporter.simplifyColors();
    exporter.usePresentationAttributes();
    exporter.inlineStyles();
    exporter.toString().should.equal('<svg xmlns="http://www.w3.org/2000/svg"><text stroke="gray" stroke-opacity=".5">text</text></svg>');
  });
});
