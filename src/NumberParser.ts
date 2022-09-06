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

import P from "parsimmon";

function parenthesize<T=any>(parser: P.Parser<T>) {
  return parser.wrap(P.string("("), P.string(")"));
}

/*
 * A parser for the numbers as produced by libflatsurf in terminal output.
 */
export const NumberLanguage = P.createLanguage({
  Float: () => P.regexp(/[+-]?[0-9]*\.[0-9]*/).map(Number).desc("float"),
  Integer: () => P.regexp(/[+-]?(0|[1-9][0-9]*)/).map(Number).desc("int"),
  Fraction: (r) => P.seq(r.Integer, P.string("/"), r.Integer).map(([a, _, b]) => a / b).desc("fraction"),

  Approximation: (r) => parenthesize(P.seq(r.SymbolicApproximated, P.string("~"), r.Float)).map(([_,__,x]) => x).desc("(?~float)"),
  Real: (r) => P.seq(P.string("ℝ"), parenthesize(P.seq(r.Float, P.string("="), r.SymbolicParenthesized))).map(entries => entries[1][0]).desc("real"),

  // Helper to throw away the left hand side of an approximation (lhs ~ rhs)
  SymbolicApproximated: (r) => P.alt(
    P.lookahead("~"),
    P.seq(P.regexp(/[^~()]+/), r.SymbolicApproximated),
    P.seq(parenthesize(r.SymbolicParenthesized), r.SymbolicApproximated),
  ),

  // Helper to throw away the right hand side of a real number (lhs=rhs)
  SymbolicParenthesized: (r) => P.alt(
    P.lookahead(")"),
    P.seq(P.regexp(/[^()]+/), r.SymbolicParenthesized),
    P.seq(parenthesize(r.SymbolicParenthesized), r.SymbolicParenthesized),
  ),

  // A unary expression -Number
  Negative: (r) => P.seq(P.string("-"), r.Primitive).map(([_, value]) => -value).desc("minus"),

  // A binary expression A*B
  Product: (r) => P.seq(r.MaybeNegative, P.string("*"), r.MaybeProduct).map(([a,_,b]) => a*b).desc("product"),

  // A binary expression A±B
  Sum: (r) => P.seq(r.MaybeProduct, P.regexp(/[+-]/), r.MaybeSum).map(([a,op,b]) => op == '-' ? a-b : a+b).desc("sum"),

  Primitive: (r) => P.alt(r.Fraction, r.Integer, r.Real, r.Approximation, r.Float, parenthesize(r.Number)),
  MaybeNegative: (r) => P.alt(r.Negative, r.Primitive),
  MaybeProduct: (r) => P.alt(r.Product, r.MaybeNegative),
  MaybeSum: (r) => P.alt(r.Sum, r.MaybeProduct),
  Number: (r) => P.alt(r.MaybeSum),
})

export function parse(x: string) {
  const value = NumberLanguage.Number.tryParse(x.replaceAll(/\s/g, ""));
  if (typeof(value) !== "number")
    throw Error(`Parsing ${x} did not produce a number but ${value}`);
  if (isNaN(value))
    throw Error(`Parsing ${x} produced NaN`);
  return value;
}
