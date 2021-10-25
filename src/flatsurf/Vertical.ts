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

// TODO: Copyright headers everywhere.

import CoordinateSystem from "@/geometry/CoordinateSystem";
import Vector, { VectorSchema } from "@/geometry/Vector";
import Flatten from "@flatten-js/core";

export type VerticalSchema = VectorSchema;

export default class Vertical {
  public static parse(yaml: VerticalSchema, coordinateSystem: CoordinateSystem): Vertical {
    return new Vertical(Vector.parse(yaml, coordinateSystem));
  }

  private constructor(vector: Vector) {
    this.vector = vector;
  }

  get coordinateSystem() {
    const rotated = new CoordinateSystem(true);
    const angle = new Vector(this.vector.parent, 0, 1).angleTo(this.vector);
    this.vector.parent.embedInto(rotated, new Flatten.Matrix().rotate(angle));
    return rotated;
  }

  public readonly vector: Vector;
}
