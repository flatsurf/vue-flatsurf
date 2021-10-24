<!--

Renders objects from flatsurf as SVG.

-->
<template>
  <svg v-on="$listeners">
    <slot name="background" />
    <slot name="triangulation">
      <flat-triangulation-component v-if="layout != null" :layout="layout" :svg="viewportCoordinateSystem" :options="visualizationOptions">
        <slot name="components">
          <flow-component-component v-for="(component, i) of flowComponents" :key="i" :color="palette.color(i)" :component="component" :layout="layout" :surface="triangulation" :svg="viewportCoordinateSystem" />
        </slot>
      </flat-triangulation-component>
    </slot>
    <slot />
  </svg>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import FlowComponent from "@/flatsurf/FlowComponent"
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layout from "@/layout/Layout";
import VisualizationOptions from "./options/VisualizationOptions";
import Palette from "@/Palette";
import SVGExporter from "@/export/SVGExporter";

import FlatTriangulationComponent from "@/components/flatsurf/FlatTriangulation.vue";
import FlowComponentComponent from "@/components/flatsurf/FlowComponent.vue";

@Component({
  components: {
    FlatTriangulationComponent,
    FlowComponentComponent,
  }
})
export default class Flatsurf extends Vue {
  @Prop({ required: true, type: Object }) triangulation!: FlatTriangulation;
  @Prop({ required: true, type: Object }) layout!: Layout;
  // TODO: This should not be required.
  @Prop({ required: true, type: Object }) viewportCoordinateSystem!: CoordinateSystem;
  // TODO: This should not be required.
  @Prop({ required: true, type: Object }) visualizationOptions!: VisualizationOptions;
  // TODO: Filter depending on automorphisms.
  @Prop({ required: false, default: () => [], type: Array }) flowComponents!: FlowComponent[];

  get palette() {
    return new Palette(this.flowComponents.length);
  }

  async svg() {
    await this.$nextTick();

    const exporter = new SVGExporter(this.$el);
    exporter.simplifyColors();
    exporter.dropNonStandardStyles();
    exporter.dropNonInkscapeStyles();
    exporter.dropTrivialStyles();
    exporter.dropRedundantStyles();
    exporter.dropClasses();
    exporter.dropPrefixedStyles();
    exporter.dropInvisible();
    exporter.dropInteractiveStyles();
    exporter.dropCustomAttributes();
    exporter.usePresentationAttributes();
    exporter.inlineStyles();
    return exporter.toString();
  }
}
</script>
