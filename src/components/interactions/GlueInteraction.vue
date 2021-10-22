<template>
  <g v-if="layout != null">
    <!-- TODO: Do this only for actual half edges not for glued edges -->
    <g v-for="halfEdge of layout.surface.halfEdges" :key="halfEdge" class="click-area" @mousemove="(e) => hover(halfEdge, e)" @mouseleave="unhover(halfEdge)" @click="glue(halfEdge, true)">
      <segment-component :segment="segment(halfEdge)" :svg="svg" />
    </g>
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import clamp from "lodash-es/clamp";

import SegmentComponent from "@/components/svg/Segment.vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import FlatTriangulationLayout from "@/layout/FlatTriangulationLayout";
import LayoutOptions from "@/layout/LayoutOptions";
import HalfEdge from "@/flatsurf/HalfEdge";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Point from "@/geometry/Point";
import Segment from "@/geometry/Segment";
import Edge from "@/flatsurf/Edge";

@Component({
  components: { SegmentComponent },
})
export default class GlueInteraction extends Vue {
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
  @Prop({required: true, type: Function}) relayout!: (layoutOptions?: LayoutOptions) => Promise<FlatTriangulationLayout | null>;
  @Prop({required: true, type: Object }) options!: VisualizationOptions;

  layout: FlatTriangulationLayout | null = null;

  async created() {
    this.layout = await this.relayout();
  }

  async glue(halfEdge: HalfEdge, glue: boolean | null) {
    const edge = new Edge(halfEdge);

    const glued = {...this.glued};
    glued[edge.positive] = glue;

    // TODO: Highlight all the glued half edges.
    this.options.select(halfEdge, true);
    this.options.select(-halfEdge, true);

    try {
      // TODO: When gluing, give a higher score to the half edges that have
      // been glued before, so the picture does not change that much?
      this.layout = await this.relayout(new LayoutOptions(
        (e: Edge) => glued[e.positive] || null,
        // TODO: Pass automorphisms here somehow.
        []));

      this.glued = glued;
    } finally {
      // TODO: Highlight the glued half edge for some time.
      // TODO: When the gluing failed, highlight the problematic half edges?
      this.options.select(halfEdge, false);
      this.options.select(-halfEdge, false);
    }
  }

  segment(halfEdge: HalfEdge): Segment {
    return this.layout!.layout(halfEdge).segment;
  }

  hover(halfEdge: HalfEdge, e: MouseEvent) {
    const at = this.segment(halfEdge).relativize(this.toPoint(e));
    this.options.indicate(halfEdge, clamp(at, 0, 1));
    this.options.indicate(-halfEdge, 1 - clamp(at, 0, 1));
  }

  unhover(halfEdge: HalfEdge) {
    this.options.indicate(halfEdge, null);
    this.options.indicate(-halfEdge, null);
  }

  toPoint(e: MouseEvent): Point {
    let svg = this.$el;
    while (svg.tagName !== "svg")
      svg = svg.parentElement!;
    return new Point(this.svg, e.clientX - svg.getBoundingClientRect().left, e.clientY - svg.getBoundingClientRect().top);
  }

  glued: {[positive: number]: boolean | null} = {};
}
</script>
<style lang="scss" scoped>
.click-area * {
  visibility: hidden !important;
  stroke: aquamarine;
  stroke-width: 30px !important;
  stroke-linejoin: round !important;
  stroke-linecap: butt !important;
  stroke-dasharray: 0 !important;
  pointer-events: all !important;
  cursor: pointer;
}
</style>
