<template>
  <g>
    <g>
      <face v-for="(face, i) of faces" :key="i" :vertices="face" />
    </g>
    <g>
      <half-edge-component v-for="halfEdge of halfEdges" :key="halfEdge" :segment="layout.layout(halfEdge).segment" :half-edge="halfEdge" />
    </g>
  </g>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Triangulation from "../geometry/triangulation/FlatTriangulation";
import Face from "./Face.vue";
import HalfEdgeComponent from "./HalfEdge.vue";
import FlatTriangulationLayout from "../geometry/layout/FlatTriangulationLayout";
import HalfEdge from "../geometry/triangulation/HalfEdge";

@Component({
  components: {
    Face,
    HalfEdgeComponent,
  }
})
export default class FlatTriangulation extends Vue {
  @Prop({required: true, type: Object}) surface!: Triangulation;
  @Prop({required: false, type: Array, default: []}) forced!: HalfEdge[];

  protected get faces() {
    return this.surface.faces.cycles.map((face) => face.map((he) => this.layout.layout(he).segment.end));
  }

  protected get halfEdges() {
    return this.surface.halfEdges;
  }

  private get layout() {
    return new FlatTriangulationLayout(this.surface, this.forced);
  }

  @Watch("layout", { immediate: true })
  layoutChanged() {
    this.$emit("layout", this.layout);
  }

}
</script>
