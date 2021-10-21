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

import SaddleConnection, { SaddleConnectionSchema } from "./SaddleConnection";
import CoordinateSystem from '@/geometry/CoordinateSystem';
import HalfEdge from "./HalfEdge";

export interface Touch {
  halfEdge: HalfEdge;
  index: number;
}

export interface FlowConnectionSchema extends SaddleConnectionSchema {
  vertical: boolean;
  boundary: boolean;
  touches: Touch[];
}

export default class FlowConnection {
  public static parse(yaml: FlowConnectionSchema, coordinateSystem: CoordinateSystem): FlowConnection {
    return new FlowConnection(SaddleConnection.parse(yaml, coordinateSystem), yaml.vertical, yaml.boundary, yaml.touches);
  }

  private constructor(connection: SaddleConnection, vertical: boolean, boundary: boolean, touches: Touch[]) {
    this.connection = connection;
    this.vertical = vertical;
    this.boundary = boundary;
    this.touches = Object.freeze(touches);
  }

  public readonly connection: SaddleConnection;
  public readonly vertical: boolean;
  public readonly boundary: boolean;

  // The sequence of half edges crossed/touched (most half edges show up in
  // pairs) and the order of this crossing/touching in comparison to all the
  // others of this component on that half edge. Typically, starts with
  // [source half edge, 0], then the first [half edge crossed, 0] if this is
  // the right-most crossing of that half edge, then [-half edge crossed,
  // 0], ... until the [target half edge, 0].
  public readonly touches: readonly Touch[];
}
