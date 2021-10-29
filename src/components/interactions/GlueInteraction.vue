<!--
 | Copyright (c) 2021 Julian Rüth <julian.rueth@fsfe.org>
 | 
 | Permission is hereby granted, free of charge, to any person obtaining a copy
 | of this software and associated documentation files (the "Software"), to deal
 | in the Software without restriction, including without limitation the rights
 | to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 | copies of the Software, and to permit persons to whom the Software is
 | furnished to do so, subject to the following conditions:
 | 
 | The above copyright notice and this permission notice shall be included in all
 | copies or substantial portions of the Software.
 | 
 | THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 | IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 | FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 | AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 | LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 | OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 | SOFTWARE.
 -->
<template>
  <g v-if="layout != null">
    <!-- TODO: Smarter glueing and unglueing: click should toggle true/null. contextmenu shuold toggle false/null. -->
    <g v-for="halfEdge of halfEdges" :key="halfEdge" class="click-area" @mousemove="(e) => hover(halfEdge, e)" @mouseleave="unhover(halfEdge)" @click="glue(halfEdge, true)" @contextmenu.prevent="glue(halfEdge, false)">
      <segment-component :segment="segment(halfEdge)" :svg="svg" />
    </g>
    <g v-for="edge of edges" :key="edge.positive" class="click-area" @click="glue(edge, true)" @contextmenu.prevent="glue(edge, false)">
      <segment-component :segment="segment(edge)" :svg="svg" />
    </g>
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import clamp from "lodash-es/clamp";
import nop from "lodash-es/noop";

import SegmentComponent from "@/components/svg/Segment.vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layout from "@/layout/Layout";
import LayoutOptions from "@/layout/LayoutOptions";
import HalfEdge from "@/flatsurf/HalfEdge";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Point from "@/geometry/Point";
import Segment from "@/geometry/Segment";
import Polygon from "@/geometry/Polygon";
import Vector from "@/geometry/Vector";
import Edge from "@/flatsurf/Edge";

@Component({
  components: { SegmentComponent },
})
export default class GlueInteraction extends Vue {
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
  @Prop({ required: true, type: Object }) layout!: Layout;
  @Prop({required: true, type: Function}) relayout!: (layoutOptions?: LayoutOptions) => Promise<Layout>;
  @Prop({required: true, type: Object }) options!: VisualizationOptions;
  @Prop({required: false, default: () => null, type: Object}) focus!: Polygon | null;
  @Prop({required: false, default: () => nop, type: Function}) refocus!: (focus: Polygon) => void;

  async glue(edge: Edge, glue: boolean | null): Promise<void>;
  async glue(edge: HalfEdge, glue: boolean | null): Promise<void>;
  async glue(halfEdge: Edge | HalfEdge, glue: boolean | null) {
    if (halfEdge instanceof Edge)
      return await this.glue(halfEdge.positive, glue);

    const edge = new Edge(halfEdge);

    const glued = {...this.glued};
    glued[edge.positive] = glue;

    // TODO: Show the gluing status on hover.
    // TODO: Highlight all the glued half edges.
    // TODO: Color code the gluing action (true/false.)
    this.options.select(halfEdge, true);
    this.options.select(-halfEdge, true);

    this.unhover(halfEdge);

    try {
      const previousStart = this.svg.embed(this.layout.layout(halfEdge).segment.start);
      const previousFocus = this.focus;

      // TODO: When gluing, give a higher score to the half edges that have
      // been glued before, so the picture does not change that much?
      const layout = await this.relayout(new LayoutOptions(
        (e: Edge) => glued[e.positive] || null,
        // TODO: Pass automorphisms here somehow.
        []));

      // TODO: Also don't do this if we cannot relate the coordinate systems before and after. We could possibly relate everything in the viewport coordinate system anyway.
      if (previousStart != null && previousFocus != null) {
        // Move the viewport such that the selected half edge does not seem to move.
        const shift = new Vector(
            this.svg,
            new Point(this.svg, previousStart.value),
            layout.layout(halfEdge).segment.start);
        this.refocus(previousFocus.translate(shift));
      }

      this.glued = glued;
    } finally {
      // TODO: Highlight the glued half edge for some time.
      // TODO: When the gluing failed, highlight the problematic half edges?
      setTimeout(() => {
        this.options.select(halfEdge, false);
        this.options.select(-halfEdge, false);
      }, 300);
    }
  }

  get halfEdges() {
    return this.layout.triangulation.halfEdges.filter((halfEdge) => !this.layout.layout(halfEdge).inner);
  }

  get edges() {
    return this.layout.triangulation.edges.filter((edge) => this.layout.layout(edge.positive).inner);
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
