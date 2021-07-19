<!--

Parses a YAML and Displays it as a Flat Triangulation.

-->
<template>
  <pan-zoom v-slot="{ viewport }" class="surface" :coordinate-system="idealCoordinateSystem" :focus="focus">
    <surface :viewport="viewport" :surface="surface" :components="components" @layout="onLayoutChanged" />
  </pan-zoom>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import YAML from "yaml";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import FlatTriangulation from "@/geometry/triangulation/FlatTriangulation";
import FlowComponent from "@/geometry/triangulation/FlowComponent";
import FlatTriangulationLayout from "@/geometry/layout/FlatTriangulationLayout";

import PanZoom from "./PanZoom.vue";
import Surface from "./Surface.vue";

@Component({
  components: {
    Surface,
    PanZoom,
  }
})
export default class SurfaceViewer extends Vue {
  @Prop({ required: true }) raw!: string;

  private readonly idealCoordinateSystem = new CoordinateSystem(true);
  protected surface: FlatTriangulation | null = null;
  protected components: FlowComponent[] = [];

  focus = this.idealCoordinateSystem.box([-1, -1], [1, 1]);

  protected onLayoutChanged(layout: FlatTriangulationLayout) {
    if (!this.focus.equalTo(layout.bbox))
      this.focus = layout.bbox;
    this.$emit('layout', layout)
  }

  @Watch("raw", { immediate: true })
  onRawChanged() {
    try {
      const parsed = YAML.parse(this.raw);
      this.surface = FlatTriangulation.parse(parsed, this.idealCoordinateSystem);
      this.components = (parsed.components || []).map((component: any) => FlowComponent.parse(component, this.idealCoordinateSystem));
      this.$emit('ok');
    } catch(e) {
      this.$emit('error', e.message);
    }
  }
}
</script>
