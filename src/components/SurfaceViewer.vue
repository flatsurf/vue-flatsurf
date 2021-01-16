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
import FlatTriangulationLayout from '@/geometry/layout/FlatTriangulationLayout';

@Component({
  components: {
    FlatTriangulationComponent,
  }
})
export default class SurfaceViewer extends Vue {
  @Prop({ required: true }) viewport!: Viewport;
  @Prop({ required: true }) surface!: FlatTriangulation;
  
  forced = [] as HalfEdge[];
  selected = [] as HalfEdge[];
  hovered = [] as HalfEdge[];

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
    this.$emit('layout', layout);
  }

  async glue(halfEdge: HalfEdge) {
    if (this.forced.includes(halfEdge) || this.forced.includes(-halfEdge))
      this.forced = this.forced.filter((he) => he !== halfEdge && he !== -halfEdge);
    else
      this.forced.unshift(halfEdge);

    this.selected.push(halfEdge); 

    await new Promise(r => setTimeout(r, 300));

    this.selected = this.selected.filter((he) => he !== halfEdge && he !== -halfEdge);
  }

  hover(halfEdge: HalfEdge) {
    this.hovered.push(halfEdge);
  }

  unhover(halfEdge: HalfEdge) {
    this.hovered = this.hovered.filter((he) => he !== halfEdge && he !== -halfEdge);
  }

  @Provide()
  halfEdgeConfiguration(halfEdge: HalfEdge) {
    return {
      interactions: {
        click: () => this.glue(halfEdge),
        enter: () => this.hover(halfEdge),
        leave: () => this.unhover(halfEdge),
      },
      state: {
        selected: this.selected.includes(halfEdge) || this.selected.includes(-halfEdge),
        glued: this.forced.includes(halfEdge) || this.forced.includes(-halfEdge),
        labeled: this.hovered.includes(halfEdge) || this.hovered.includes(-halfEdge),
      },
    };
  }
}
</script>
