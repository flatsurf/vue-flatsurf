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

    return {
      indicator: this.indicators[halfEdge],
      selected: this.selected[halfEdge],
    }
  }

  public indicate(halfEdge: HalfEdge, at: number | null) {
    Vue.set(this.indicators, halfEdge, at);
  }

  public select(halfEdge: HalfEdge, selected: boolean) {
    Vue.set(this.selected, halfEdge, selected);
  }

  private indicators = {} as {[halfEdge: number]: number | null};
  private selected = {} as {[halfEdge: number]: boolean};
};
