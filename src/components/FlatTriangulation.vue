<template>
  <g class="FlatTriangulation">
    <g>
      <face v-for="(face, i) of faces" :key="i" :vertices="face" />
    </g>
    <g>
      <half-edge-component v-for="halfEdge of halfEdges" :key="halfEdge" :class="{ inner: surface.layout(halfEdge).inner }" :segment="surface.layout(halfEdge).segment" :half-edge="halfEdge" />
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

  get halfEdges() {
    return this.surface.surface.halfEdges;
  }

  get faces() {
    return this.surface.surface.faces.cycles.map((face) => face.map((he) => this.surface!.layout(he).segment.end)) as any;
  }
}
</script>
<style>
.FlatTriangulation .inner {
  display: none;
}

.FlatTriangulation:hover .inner {
  display: unset;
}
</style>
