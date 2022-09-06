/* ******************************************************************************
 * Copyright (c) 2022 Julian Rüth <julian.rueth@fsfe.org>
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

import { expect } from "chai";

import { parse } from "@/NumberParser";


describe("NumberParser", () => {
  it("can parse integers", () => {
    expect(parse("1")).to.equal(1);
    expect(parse("-1")).to.equal(-1);
    expect(parse("+1")).to.equal(1);
    expect(parse("- 1")).to.equal(-1);
  });

  it("can parse approximations", () => {
    expect(parse("(3/2~1.5000000)")).to.equal(1.5);
  });

  it("can parse expressions", () => {
    expect(parse("2*3")).to.equal(2*3);
    expect(parse("2*3 + 1")).to.equal(2*3 + 1);
    expect(parse("1 + 2*3")).to.equal(1 + 2*3);
    expect(parse("2*3 + 5*7")).to.equal(2*3 + 5*7);
    expect(parse("2*3 + 5*(7 + 11)")).to.equal(2*3 + 5*(7 + 11));
  });

  it("can parse exact reals", () => {
    expect(parse("ℝ(2.00114=9228629358915783047p-62+ℝ(0.303644…)p-62)")).to.equal(2.00114);
    expect(parse("(3/2~1.5000000)*ℝ(2.00114=9228629358915783047p-62+ℝ(0.303644…)p-62)")).to.equal(3.00171);
    expect(parse("(3/2~1.5000000)*ℝ(2.00114=9228629358915783047p-62+ℝ(0.303644…)p-62)-(1/2~0.50000000)")).to.equal(2.50171);
  })
});
