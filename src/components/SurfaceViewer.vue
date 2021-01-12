<!--

A reactive SVG that displays a Flat Triangulation.

-->
<template>
  <svg :width="viewport.width" :height="viewport.height">
    <ngon v-for="(face, i) of faces" :key="i" :vertices="face" />
  </svg>
</template>
<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";

import Viewport from "../geometry/Viewport";
import FlatTriangulation from "../geometry/triangulation/FlatTriangulation";
import FlatTriangulationLayout from "../geometry/layout/FlatTriangulationLayout";

import Ngon from "./svg/Ngon.vue";

import Point from "@/geometry/Point";

@Component({
  components: {
    Ngon
  }
})
export default class SurfaceViewer extends Vue {
  @Prop({ required: true }) viewport!: Viewport;
  @Prop({ required: true }) surface!: FlatTriangulation;

  private get layout() {
    return new FlatTriangulationLayout({ surface: this.surface, coordinateSystem: this.viewport.idealCoordinateSystem });
  }

  protected get faces() {
    return this.surface.faces.cycles.map((face) => face.map((he) => this.layout.layout(he).segment.end));
  }

  @Watch("layout", { immediate: true })
  layoutChanged() {
    this.$emit("layout", this.layout);
  }

  @Provide()
  svg(xy: Point) {
    return this.viewport.viewportCoordinateSystem.embed(xy);
  }
}
</script>
