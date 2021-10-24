<!--

Displays a surface from flatsurf and related objects such as flow components.

-->
<template>
  <pan-zoom v-slot="{ viewport }" :coordinate-system="idealCoordinateSystem" v-model="focus">
    <flatsurf v-if="layout != null" :width="viewport.width" :height="viewport.height" @dblclick="focus = layout.hull" :triangulation="triangulation" :layout="layout" :viewport-coordinate-system="viewport.viewportCoordinateSystem" :visualization-options="visualizationOptions" :flow-components="flowComponents">
      <slot name="interaction" v-bind:layout="layout" v-bind:svg="viewport.viewportCoordinateSystem" v-bind:triangulation="triangulation" v-bind:options="visualizationOptions" v-bind:focus="focus" v-bind:refocus="refocus" />
    </flatsurf>
  </pan-zoom>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import Layout from "@/layout/Layout";
import Polygon from "@/geometry/Polygon";
import FlowComponent from "@/flatsurf/FlowComponent"
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";

import PanZoom from "./PanZoom.vue";
import Flatsurf from "./flatsurf/Flatsurf.vue";

@Component({
  components: {
    PanZoom,
    Flatsurf,
  }
})
export default class Viewer extends Vue {
  @Prop({ required: true, type: Object }) triangulation!: FlatTriangulation;
  @Prop({ required: false, default: () => [], type: Array }) flowComponents!: FlowComponent[];
  @Prop({ required: true, type: Object }) layout!: Layout;

  protected visualizationOptions = new VisualizationOptions();

  private focus: Polygon | null = null;

  get idealCoordinateSystem() {
    return this.triangulation.coordinateSystem;
  }

  /* TODO: Find another way to expose this.
  @Watch("inner", {immediate: true})
  onInnerChanged() {
    this.forced = this.inner;
  }
  */

  refocus(focus: Polygon) {
    if (this.focus == null || !this.focus.equalTo(focus))
      this.focus = focus;
  }

  /* TODO: Where should this go?
  @Watch("triangulation", { immediate: true })
  onSurfaceChanged() {
    this.visualizationOptions = new VisualizationOptions();
  }
  */

  @Watch("layout", { immediate: true })
  onLayoutChanged() {
    if (this.focus == null)
      this.refocus(this.layout.hull);
  }
}
</script>
