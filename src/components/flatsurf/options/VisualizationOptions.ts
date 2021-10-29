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
import Edge from "@/flatsurf/Edge";
import IHalfEdgeOptions from "./IHalfEdgeOptions";
import IFlatTriangulationOptions from "./IFlatTriangulationOptions";

export default class VisualizationOptions implements IFlatTriangulationOptions {
  public get(edge: Edge): IHalfEdgeOptions;
  public get(edge: HalfEdge): IHalfEdgeOptions;
  public get(halfEdge: Edge | HalfEdge): IHalfEdgeOptions {
    this.ensure(halfEdge);
    if (halfEdge instanceof Edge) {
      const edge = halfEdge;
      return this.edges[edge.positive];
    } else {
      return this.halfEdges[halfEdge];
    }
  }

  private ensure(halfEdge: Edge | HalfEdge) {
    if (halfEdge instanceof Edge) {
      const edge = halfEdge;
      if (this.edges[edge.positive] === undefined) {
        Vue.set(this.edges, edge.positive, {
          indicator: null,
          selected: false,
          visible: true,
          label: null,
          icon: null,
        } as IHalfEdgeOptions);
      }
    } else {
      if (this.halfEdges[halfEdge] === undefined) {
        Vue.set(this.halfEdges, halfEdge, {
          indicator: null,
          selected: false,
          visible: false,
          label: null,
          icon: null,
        } as IHalfEdgeOptions);
      }
    }
  }

  public indicate(edge: Edge, at: number | null): void;
  public indicate(edge: HalfEdge, at: number | null): void;
  public indicate(halfEdge: Edge | HalfEdge, at: number | null) {
    this.ensure(halfEdge);
    if (halfEdge instanceof Edge) {
      const edge = halfEdge;
      this.edges[edge.positive].indicator = at;
    } else {
      this.halfEdges[halfEdge].indicator = at;
    }
  }

  public select(edge: Edge, selected: boolean): void;
  public select(edge: HalfEdge, selected: boolean): void;
  public select(halfEdge: Edge | HalfEdge, selected: boolean) {
    this.ensure(halfEdge);
    if (halfEdge instanceof Edge) {
      const edge = halfEdge;
      this.edges[edge.positive].selected = selected;
    } else {
      this.halfEdges[halfEdge].selected = selected;
    }
  }

  public show(edge: Edge, visible: boolean): void;
  public show(halfEdge: HalfEdge, visible: boolean): void;
  public show(halfEdge: Edge | HalfEdge, visible: boolean) {
    this.ensure(halfEdge);
    if (halfEdge instanceof Edge) {
      const edge = halfEdge;
      this.edges[edge.positive].visible = visible;
    } else {
      this.halfEdges[halfEdge].visible = visible;
    }
  }

  public label(edge: Edge, label: string | null): void;
  public label(halfEdge: HalfEdge, label: string | null): void;
  public label(halfEdge: Edge | HalfEdge, label: string | null) {
    this.ensure(halfEdge);
    if (halfEdge instanceof Edge) {
      const edge = halfEdge;
      this.edges[edge.positive].label = label;
    } else {
      this.halfEdges[halfEdge].label = label;
    }
  }

  public icon(edge: Edge, icon: string | null): void;
  public icon(halfEdge: HalfEdge, icon: string | null): void;
  public icon(halfEdge: Edge | HalfEdge, icon: string | null) {
    this.ensure(halfEdge);
    if (halfEdge instanceof Edge) {
      const edge = halfEdge;
      this.edges[edge.positive].icon = icon;
    } else {
      this.halfEdges[halfEdge].icon = icon;
    }
  }

  private halfEdges: {
    [halfEdge: number]: {
      indicator: number | null,
      selected: boolean,
      visible: boolean,
      label: string | null,
      icon: string | null,
    },
  } = {};

  private edges: {
    [positive: number]: {
      indicator: number | null,
      selected: boolean,
      visible: boolean,
      label: string | null,
      icon: string | null,
    },
  } = {};
};
