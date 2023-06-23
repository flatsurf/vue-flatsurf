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

import xor from "lodash-es/xor";

// A permutation of T where T is something that can be safely converted to a
// key in an object, i.e., T should probably be number or string.
export default class Permutation<T> {
  public static parse(raw: string): Permutation<number> {
    return Permutation.fromCycles<number>(raw.substr(1, raw.length - 2).split(/\)\(/).map(cycle => cycle.split(/, /).map((s) => s.replaceAll(' ', '')).map(Number)));
  }

  public static fromCycles<T>(cycles: Array<T[]>) : Permutation<T> {
    const mapping = [] as Array<[T, T]>;
    for (let cycle of cycles)
      for (let i = 0; i < cycle.length; i++)
        mapping.push([cycle[i], cycle[(i + 1) % cycle.length]]);
    return Permutation.fromMapping(mapping);
  }

  public static fromMapping<T>(mapping: Array<[T, T]>) : Permutation<T> {
    return new Permutation<T>(mapping);
  }

  private constructor(mapping: Array<[T, T]>) {
    this.mapping = {};
    this.inverse = {};

    for (let entry of mapping) {
      if ((entry[0] as any) in this.mapping)
        throw Error(`${entry} specified more than once in mapping domain`);
      if ((entry[1] as any) in this.inverse)
        throw Error(`${entry} specified more than once in mapping codomain`);
      this.mapping[String(entry[0])] = entry[1];
      this.inverse[String(entry[1])] = entry[0];
    }

    if (xor(Object.keys(this.mapping), Object.keys(this.inverse)).length !== 0)
      throw Error(`domain {${Object.keys(this.mapping)}} and codomain {${Object.keys(this.inverse)}} of permutation are not identical`);

    this.cycles = [];
    for (let [a, b] of mapping) {
      if (this.cycles.find((cycle) => cycle.includes(a)))
        continue;
      const cycle = [a, b];
      while(true) {
        const x = cycle[cycle.length - 1];
        if (cycle[0] == x) {
          cycle.pop();
          break;
        }
        cycle.push(this.mapping[String(x)]);
      }
      this.cycles.push(cycle);
    }
  }

  public image(x: T) {
    return this.mapping[String(x)];
  }

  public preimage(x: T) {
    return this.inverse[String(x)];
  }

  public get domain() : T[] {
    return Object.values(this.mapping);
  }

  public readonly cycles : Array<T[]>;

  private readonly mapping : { [key: string]: T }; 
  private readonly inverse : { [key: string]: T };
}
