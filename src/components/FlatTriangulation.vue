<template>
  <g class="FlatTriangulation">
    <g>
      <face v-for="(face, i) of faces" :key="i" :vertices="face" />
    </g>
    <slot />
    <g>
      <half-edge-component v-for="halfEdge of halfEdges" :key="halfEdge" :inner="surface.layout(halfEdge).inner" :surface="surface" :half-edge="halfEdge" />
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
    return this.surface.surface.faces.cycles.map((face) => face.map((he) => this.surface!.layout(he).segment.end)) as any;
  }

  get halfEdges() {
    return this.surface.surface.halfEdges.filter((halfEdge) => {
      if (!this.surface.layout(halfEdge).inner)
        return true;
      return halfEdge > 0;
    });
  }
}
</script>
<style lang="scss">
.FlatTriangulation:hover {
  --flat-triangulation-hover: 1;
}
</style>
