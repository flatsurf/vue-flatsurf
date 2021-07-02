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

import CoordinateSystem from '../CoordinateSystem';
import FlowConnection, { FlowConnectionSchema } from "./FlowConnection";

export default class FlowComponent {
  public static parse(yaml: {
    cylinder: boolean,
    perimeter: FlowConnectionSchema[],
  }, coordinateSystem: CoordinateSystem) : FlowComponent {
    return new FlowComponent(yaml.cylinder, yaml.perimeter.map(connection => FlowConnection.parse(connection, coordinateSystem)));
  }

  private constructor(cylinder: boolean, perimeter: FlowConnection[]) {
    this.cylinder = cylinder;
    this.perimeter = perimeter;
  }

  public readonly cylinder: boolean;
  public readonly perimeter: FlowConnection[];
}
