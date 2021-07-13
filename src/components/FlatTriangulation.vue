<template>
  <g v-if="layout != null" class="FlatTriangulation">
    <g>
      <face v-for="(face, i) of faces" :key="i" :vertices="face" />
    </g>
    <g>
      <half-edge-component v-for="halfEdge of halfEdges" :key="halfEdge" :class="{ inner: layout.layout(halfEdge).inner }" :segment="layout.layout(halfEdge).segment" :half-edge="halfEdge" />
    </g>
  </g>
</template>
<script lang="ts">
import { Vue, Component, Inject, Prop, Watch } from "vue-property-decorator";
import Triangulation from "../geometry/triangulation/FlatTriangulation";
import Face from "./Face.vue";
import Point from "../geometry/Point";
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
  protected halfEdges = [] as HalfEdge[];
  protected faces = [] as Point[];

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

  static _run(callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>): void {
    callback(new CancellationToken(), new Progress());
  }

  @Inject({ from: 'run', default: () => FlatTriangulation._run})
  run!: (callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) => void;

  async relayout() {
    this.cancellation.abort();
    this.run(async (cancellation, progress) => {
      this.cancellation = cancellation;
      try {
        this.layout = await FlatTriangulationLayout.layout(this.surface, (he: HalfEdge) => this.forced.includes(he), this.cancellation, progress);
      } catch (e) {
        if (e instanceof OperationAborted) return;
        throw e;
      }
      this.$emit("layout", this.layout);
      this.halfEdges = this.surface.halfEdges;
      this.faces = this.surface.faces.cycles.map((face) => face.map((he) => this.layout!.layout(he).segment.end)) as any;
    });

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
