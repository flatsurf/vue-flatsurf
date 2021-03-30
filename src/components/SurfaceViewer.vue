<!--

A reactive SVG that displays a Flat Triangulation.

-->
<template>
  <svg :width="viewport.width" :height="viewport.height">
    <flat-triangulation-component :surface="surface" @layout="onLayoutChanged" :forced="forced" />
  </svg>
</template>
<script lang="ts">
import { Component, Prop, Vue, Provide } from "vue-property-decorator";

import Viewport from "../geometry/Viewport";
import FlatTriangulation from "../geometry/triangulation/FlatTriangulation";
import FlatTriangulationComponent from "./FlatTriangulation.vue";
import HalfEdge from "../geometry/triangulation/HalfEdge";

import Point from "@/geometry/Point";
import Vector from "@/geometry/Vector";
import Segment from "@/geometry/Segment";
import FlatTriangulationLayout from '@/geometry/layout/FlatTriangulationLayout';
import { IHalfEdgeConfiguration } from "./HalfEdgeConfiguration";

@Component({
  components: {
    FlatTriangulationComponent,
  }
})
export default class SurfaceViewer extends Vue {
  @Prop({ required: true }) viewport!: Viewport;
  @Prop({ required: true }) surface!: FlatTriangulation;
  
  layout = null as FlatTriangulationLayout | null;
  forced = [] as HalfEdge[];
  selected = [] as HalfEdge[];
  hovered = [] as HalfEdge[];
  indicator = {} as Record<HalfEdge, number | null>;

  @Provide()
  svg(xy: Vector | Point) : Vector | Point {
    if (xy instanceof Vector)
      return this.viewport.viewportCoordinateSystem.embed(xy);
    if (xy instanceof Point)
      return this.viewport.viewportCoordinateSystem.embed(xy);
    throw new Error("Cannot embed this type into the SVG coordinate system yet.");
  }

  forceHalfEdge(halfEdge: HalfEdge) {
    this.forced.push(halfEdge);
  }

  onLayoutChanged(layout: FlatTriangulationLayout) {
    this.layout = layout;
    this.$emit('layout', layout);
  }

  async glue(halfEdge: HalfEdge) {
    if (this.forced.includes(halfEdge) || this.forced.includes(-halfEdge))
      this.forced = this.forced.filter((he) => he !== halfEdge && he !== -halfEdge);
    else
      this.forced.unshift(halfEdge);

    this.selected.push(halfEdge); 

    await new Promise(resolve => this.$once("layout", resolve));

    await new Promise(resolve => setTimeout(resolve, 500));

    this.selected = this.selected.filter((he) => he !== halfEdge && he !== -halfEdge);
  }

  hover(halfEdge: HalfEdge, at: number) {
    this.hovered.push(halfEdge);
    this.indicator[halfEdge] = at;
    this.indicator[-halfEdge] = 1 - at;
  }

  unhover(halfEdge: HalfEdge) {
    this.hovered = this.hovered.filter((he) => he !== halfEdge && he !== -halfEdge);
    this.indicator[halfEdge] = null;
    this.indicator[-halfEdge] = null;
  }

  private relativizeOntoSegment(segment: Segment, point: Point): number {
    const e = segment.value.tangentInStart();
    const toPoint = new Vector(segment.parent, segment.start, point).value;
    return e.dot(toPoint) / segment.value.length;
  }

  @Provide()
  halfEdgeConfiguration(halfEdge: HalfEdge): IHalfEdgeConfiguration {
    return {
      interactions: {
        click: () => {
          this.unhover(halfEdge)
          this.glue(halfEdge)
        },
        enter: (ev: MouseEvent, segment: Segment) => this.hover(halfEdge, this.relativizeOntoSegment(segment, new Point(this.viewport.viewportCoordinateSystem, ev.clientX, ev.clientY))),
        leave: () => this.unhover(halfEdge),
        hover: (ev: MouseEvent, segment: Segment) => this.hover(halfEdge, this.relativizeOntoSegment(segment, new Point(this.viewport.viewportCoordinateSystem, ev.clientX, ev.clientY))),
      },
      state: {
        selected: this.selected.includes(halfEdge) || this.selected.includes(-halfEdge),
        glued: this.forced.includes(halfEdge) || this.forced.includes(-halfEdge),
        labeled: this.hovered.includes(halfEdge) || this.hovered.includes(-halfEdge),
        indicator: this.indicator[halfEdge],
      },
    };
  }
}
</script>
