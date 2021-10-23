<!--

  Displays a Surface with a given layout.

-->
<template>
  <g class="FlatTriangulation">
    <slot name="faces">
      <g>
        <face v-for="(face, i) of faces" :key="i" :vertices="face" :svg="svg" />
      </g>
    </slot>
    <slot />
    <slot name="edges">
      <g>
        <half-edge-component v-for="halfEdge of halfEdges" :key="halfEdge" :inner="layout.layout(halfEdge).inner" :layout="layout" :half-edge="halfEdge" :source-indicator="sourceIndicators.includes(halfEdge)" :options="options.get(halfEdge)" :svg="svg" />
      </g>
    </slot>
    <slot name="overlay" />
  </g>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Face from "./Face.vue";
import HalfEdgeComponent from "./HalfEdge.vue";
import Layout from "@/layout/Layout";
import IFlatTriangulationOptions from "@/components/flatsurf/options/IFlatTriangulationOptions";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import CoordinateSystem from "@/geometry/CoordinateSystem";

@Component({
  components: {
    Face,
    HalfEdgeComponent,
  }
})
export default class FlatTriangulation extends Vue {
  @Prop({required: true, type: Object}) layout!: Layout;
  @Prop({required: false, default: () => new VisualizationOptions(), type: Object}) options!: IFlatTriangulationOptions;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;

  get faces() {
    let faces = this.layout.surface.faces.cycles;
    faces = faces.filter((face) => face.every((he) => this.layout.primary.includes(he)));
    return faces.map((face) => face.map((he) => this.layout.layout(he).segment.end));
  }

  get halfEdges() {
    return this.layout.surface.halfEdges.filter((halfEdge) => {
      if (!this.layout.primary.includes(halfEdge))
        return false;
      if (!this.layout.layout(halfEdge).inner)
        return true;
      return halfEdge > 0;
    });
  }

  // Return a list of vertex indicators where half edges meet that are almost collinear.
  get sourceIndicators() {
    return this.halfEdges.filter((a) => {
      if (this.layout.layout(a).inner) return false;

      const s = this.layout.layout(a).segment;
      const v = s.tangentInStart;
      return this.halfEdges.some((b) => {
        if (b === a) return false;
        if (this.layout.layout(b).inner) return false;

        const t = this.layout.layout(b).segment;

        if (!s.start.on(t)) return false;

        const w = t.tangentInStart;
        const angle = v.angleTo(w);
        const degree = Math.PI / 180;
        return angle < degree || angle > 359 * degree;
      })
    });
  }
}
</script>
<style lang="scss">
.FlatTriangulation:hover {
  --flat-triangulation-hover: 1;
}
</style>
