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

import Permutation from "@/flatsurf/Permutation";

chai.use(chaiEquals);

describe("Permutation of Half Edges", () => {
  it("can be created from cycles", () => {
    const vertices = Permutation.fromCycles([ [3, 2, -1, -3, -2, 1] ]);
    vertices.cycles.should.have.lengthOf(1);

    vertices.image(3).should.equal(2);
    vertices.preimage(3).should.equal(1);
  });

  it("detects illegal inputs", () => {
    (() => { Permutation.fromCycles([ [1, 2, 1, 3] ]) }).should.throw();
    (() => { Permutation.fromCycles([ [1], [2], [1, 2] ]) }).should.throw();
  });
});
