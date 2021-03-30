<template>
  <g>
    <g v-if="ready">
      <g>
        <face v-for="(face, i) of faces" :key="i" :vertices="face" />
      </g>
      <g>
        <half-edge-component v-for="halfEdge of halfEdges" :key="halfEdge" :segment="layout.layout(halfEdge).segment" :half-edge="halfEdge" />
      </g>
    </g>
  </g>
</template>
<script lang="ts">
import { Vue, Component, Inject, Prop, Watch } from "vue-property-decorator";
import Triangulation from "../geometry/triangulation/FlatTriangulation";
import Face from "./Face.vue";
import HalfEdgeComponent from "./HalfEdge.vue";
import FlatTriangulationLayout from "../geometry/layout/FlatTriangulationLayout";
import HalfEdge from "../geometry/triangulation/HalfEdge";
import CancellationToken, { OperationAborted } from "@/CancellationToken";
import Progress from "@/Progress";

@Component({
  components: {
    Face,
    HalfEdgeComponent,
  }
})
export default class FlatTriangulation extends Vue {
  @Prop({required: true, type: Object}) surface!: Triangulation;
  @Prop({required: false, type: Array, default: []}) forced!: HalfEdge[];

  private layout = null as FlatTriangulationLayout | null;
  private cancellation = new CancellationToken();

  protected get faces() {
    const layout = this.layout;
    if (layout === null)
      return [];
    return this.surface.faces.cycles.map((face) => face.map((he) => layout.layout(he).segment.end));
  }

  protected get halfEdges() {
    return this.surface.halfEdges;
  }

  protected get ready() {
    return this.layout != null;
  }

  created() {
    this.relayout();
  }

  @Watch("surface")
  surfaceChanged() {
    this.relayout();
  }

  @Watch("forced")
  forcedChanged() {
    this.relayout();
  }

  @Inject({ from: 'run', default: async (callback: (cancellation: CancellationToken, progress: Progress) => void) => { callback(new CancellationToken(), new Progress());}}) 
  run!: (callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) => void;

  async relayout() {
    this.cancellation.abort();
    this.run(async (cancellation, progress) => {
      this.cancellation = cancellation;
      try {
        this.layout = await FlatTriangulationLayout.layout(this.surface, this.forced, this.cancellation, progress);
      } catch (e) {
        if (e instanceof OperationAborted) return;
        throw e;
      }
      this.$emit("layout", this.layout);
    });

  }
}
</script>
