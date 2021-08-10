<template>
  <g class="FlatTriangulation">
    <g>
      <face v-for="(face, i) of faces" :key="i" :vertices="face" />
    </g>
    <slot />
    <g>
      <half-edge-component v-for="halfEdge of halfEdges" :key="halfEdge" :inner="surface.layout(halfEdge).inner" :surface="surface" :half-edge="halfEdge" :source-indicator="sourceIndicators.includes(halfEdge)" />
    </g>
  </g>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Face from "./Face.vue";
import HalfEdgeComponent from "./HalfEdge.vue";
import FlatTriangulationLayout from "../geometry/layout/FlatTriangulationLayout";

@Component({
  components: {
    Face,
    HalfEdgeComponent,
  }
})
export default class FlatTriangulation extends Vue {
  @Prop({required: true, type: Object}) surface!: FlatTriangulationLayout;

  get faces() {
    let faces = this.surface.surface.faces.cycles;
    faces = faces.filter((face) => face.every((he) => this.surface.primary.includes(he)));
    return faces.map((face) => face.map((he) => this.surface.layout(he).segment.end));
  }

  get halfEdges() {
    return this.surface.surface.halfEdges.filter((halfEdge) => {
      if (!this.surface.primary.includes(halfEdge))
        return false;
      if (!this.surface.layout(halfEdge).inner)
        return true;
      return halfEdge > 0;
    });
  }

  // Return a list of vertex indicators where half edges meet that are almost collinear.
  get sourceIndicators() {
    return this.halfEdges.filter((a) => {
      if (this.surface.layout(a).inner) return false;

      const s = this.surface.layout(a).segment;
      const v = s.tangentInStart;
      return this.halfEdges.some((b) => {
        if (b === a) return false;
        if (this.surface.layout(b).inner) return false;

        const t = this.surface.layout(b).segment;

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
