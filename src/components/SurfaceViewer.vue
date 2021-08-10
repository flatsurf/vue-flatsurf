<!--

Parses a YAML and Displays it as a Flat Triangulation.

-->
<template>
  <pan-zoom v-slot="{ viewport }" class="surface" :coordinate-system="idealCoordinateSystem" :focus="focus">
    <surface :viewport="viewport" :surface="surface" :automorphisms="automorphisms" :components="components" @layout="onLayoutChanged" @svg="onSVGChanged" :inner="inner" />
  </pan-zoom>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import YAML from "yaml";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import FlatTriangulation from "@/geometry/triangulation/FlatTriangulation";
import Automorphism from "@/geometry/triangulation/Automorphism";
import FlowComponent from "@/geometry/triangulation/FlowComponent";
import FlatTriangulationLayout from "@/geometry/layout/FlatTriangulationLayout";
import HalfEdge from "../geometry/triangulation/HalfEdge";

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
  @Prop({ required: false, default: () => [], type: Array }) inner!: HalfEdge[];

  private readonly idealCoordinateSystem = new CoordinateSystem(true);
  protected surface: FlatTriangulation | null = null;
  protected components: FlowComponent[] = [];
  protected automorphisms: Automorphism[] = [];

  focus = this.idealCoordinateSystem.box([-1, -1], [1, 1]);

  protected onLayoutChanged(layout: FlatTriangulationLayout) {
    if (!this.focus.equalTo(layout.bbox))
      this.focus = layout.bbox;
    this.$emit('layout', layout)
    this.$emit('update:inner', this.surface!.halfEdges.filter((he) => layout.layout(he).inner));
  }

  protected onSVGChanged(svg: string) {
    this.$emit('svg', svg);
  }

  @Watch("raw", { immediate: true })
  onRawChanged() {
    try {
      const parsed = YAML.parse(this.raw);
      this.surface = FlatTriangulation.parse(parsed, this.idealCoordinateSystem);
      this.components = (parsed.components || []).map((component: any) => FlowComponent.parse(component, this.idealCoordinateSystem));
      this.automorphisms = (parsed.automorphisms || []).map((automorphism: any) => Automorphism.parse(automorphism));
      this.$emit('ok');
    } catch(e) {
      this.$emit('error', e.message);
    }
  }
}
</script>
