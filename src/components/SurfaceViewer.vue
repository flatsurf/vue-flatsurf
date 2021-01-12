<!--

A reactive SVG that displays a Flat Triangulation.

-->
<template>
  <svg :width="viewport.width" :height="viewport.height">
    <flat-triangulation-component :surface="surface" @layout="onLayoutChanged" />
  </svg>
</template>
<script lang="ts">
import { Component, Prop, Vue, Provide } from "vue-property-decorator";

import Viewport from "../geometry/Viewport";
import FlatTriangulation from "../geometry/triangulation/FlatTriangulation";
import FlatTriangulationComponent from "./FlatTriangulation.vue";

import Point from "@/geometry/Point";
import FlatTriangulationLayout from '@/geometry/layout/FlatTriangulationLayout';

@Component({
  components: {
    FlatTriangulationComponent,
  }
})
export default class SurfaceViewer extends Vue {
  @Prop({ required: true }) viewport!: Viewport;
  @Prop({ required: true }) surface!: FlatTriangulation;

  @Provide()
  svg(xy: Point) {
    return this.viewport.viewportCoordinateSystem.embed(xy);
  }

  onLayoutChanged(layout: FlatTriangulationLayout) {
    this.$emit('layout', layout);
  }
}
</script>
