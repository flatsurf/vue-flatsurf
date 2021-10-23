<!--

Renders objects from flatsurf as SVG.

-->
<template>
  <svg v-on="$listeners">
    <slot name="background" />
    <flat-triangulation-component v-if="layout != null" :layout="layout" :svg="viewportCoordinateSystem" :options="visualizationOptions">
      <!--<flow-component-component v-for="(component, i) of components" :key="i" :color="palette.color(i)" :component="component" :layout="layout" :surface="triangulation" :svg="viewportCoordinateSystem" />-->
    </flat-triangulation-component>
    <slot />
  </svg>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import FlatTriangulationLayout from "@/layout/FlatTriangulationLayout";
import VisualizationOptions from "./options/VisualizationOptions";

import FlatTriangulationComponent from "@/components/flatsurf/FlatTriangulation.vue";

@Component({
  components: {
    FlatTriangulationComponent,
  }
})
export default class Flatsurf extends Vue {
  @Prop({ required: true, type: Object }) triangulation!: FlatTriangulation;
  @Prop({ required: true, type: Object }) idealCoordinateSystem!: CoordinateSystem;
  @Prop({ required: true, type: Object }) layout!: FlatTriangulationLayout;
  // TODO: Thih should not be required.
  @Prop({ required: true, type: Object }) viewportCoordinateSystem!: CoordinateSystem;
  // TODO: Thih should not be required.
  @Prop({ required: true, type: Object }) visualizationOptions!: VisualizationOptions;
}
</script>
