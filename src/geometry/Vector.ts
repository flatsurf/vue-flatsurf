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

import Flatten from "@flatten-js/core";

import CoordinateSystem, { Coordinate } from "./CoordinateSystem";
import Point from './Point';

export interface VectorSchema {
  x: number,
  y: number,
};

export default class Vector {
  public constructor(parent: CoordinateSystem, x: Coordinate, y: Coordinate);
  public constructor(parent: CoordinateSystem, p: Flatten.Vector);
  public constructor(parent: CoordinateSystem, a: Point, b: Point);
  public constructor(parent: CoordinateSystem, x: Coordinate | Flatten.Vector | Point, y?: Coordinate | Point) {
    this.parent = parent;
    if (typeof(x) === "number" && typeof(y) === "number") {
      this.value = new Flatten.Vector(x, y);
    } else if (x instanceof Flatten.Vector && y == null) {
      this.value = x;
    } else if (x instanceof Point && y instanceof Point) {
      const a = parent.embed(x);
      const b = parent.embed(y);
      this.value = new Flatten.Vector(a.value, b.value);
    } else
      throw Error(`Cannot initialize Vector from this data: parent=${parent}, x=${x}, y=${y}`);
  }

  public static parse(yaml: VectorSchema, coordinateSystem: CoordinateSystem): Vector {
    return new Vector(coordinateSystem, yaml.x, yaml.y);
  }
  
  public get x() { return this.value.x; }
  public get y() { return this.value.y; }
  public get xy() : [Coordinate, Coordinate] { return [this.x, this.y]; }

  public rotate90CW() {
    return new Vector(this.parent, this.parent.positive ? this.value.rotate90CW(): this.value.rotate90CCW());
  }

  public rotate90CCW() {
    return new Vector(this.parent, this.parent.positive ? this.value.rotate90CCW(): this.value.rotate90CW());
  }

  public normalize() {
    return new Vector(this.parent, this.value.normalize());
  }

  public multiply(scalar: number) {
    return new Vector(this.parent, this.value.multiply(scalar));
  }

  public angleTo(ccw: Vector) {
    return this.parent.positive ? this.parent.embed(ccw).value.angleTo(this.value) : this.value.angleTo(this.parent.embed(ccw).value);
  }

  public invert() {
    return new Vector(this.parent, this.value.invert());
  }

  public add(v: Vector) {
    return new Vector(this.parent, this.value.add(this.parent.embed(v).value));
  }

  public equalTo(rhs: Vector, epsilon: number = 0): boolean {
    if (this.parent === rhs.parent)
      return Math.abs(this.x - rhs.x) <= epsilon && Math.abs(this.y - rhs.y) <= epsilon;
    return this.parent.embed(rhs).equalTo(this);
  }

  public readonly parent: CoordinateSystem;
  public readonly value: Flatten.Vector;
}
