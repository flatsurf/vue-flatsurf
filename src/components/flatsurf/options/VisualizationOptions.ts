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

import Vue from "vue";

import HalfEdge from "@/flatsurf/HalfEdge";
import IFlatTriangulationOptions from "./IFlatTriangulationOptions";
import IHalfEdgeOptions from "./IHalfEdgeOptions";

export default class VisualizationOptions implements IFlatTriangulationOptions {
  public get(halfEdge: HalfEdge): IHalfEdgeOptions {
    if (this.indicators[halfEdge] === undefined)
      this.indicate(halfEdge, null);
    if (this.selected[halfEdge] === undefined)
      this.select(halfEdge, false);
    if (this.visible[halfEdge] === undefined)
      this.show(halfEdge, false);
    if (this.labels[halfEdge] === undefined)
      this.label(halfEdge, null);

    return {
      visible: this.visible[halfEdge],
      indicator: this.indicators[halfEdge],
      selected: this.selected[halfEdge],
      label: this.labels[halfEdge],
    }
  }

  public indicate(halfEdge: HalfEdge, at: number | null) {
    Vue.set(this.indicators, halfEdge, at);
  }

  public select(halfEdge: HalfEdge, selected: boolean) {
    Vue.set(this.selected, halfEdge, selected);
  }

  public show(halfEdge: HalfEdge, visible: boolean) {
    Vue.set(this.visible, halfEdge, visible);
  }

  public label(halfEdge: HalfEdge, label: string | null) {
    Vue.set(this.labels, halfEdge, label);
  }

  private indicators = {} as {[halfEdge: number]: number | null};
  private selected = {} as {[halfEdge: number]: boolean};
  private visible = {} as {[halfEdge: number]: boolean};
  private labels = {} as {[halfEdge: number]: string};
};
