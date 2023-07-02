<!--
  Overlay of an edge that renders an invisible but clickable area to modify how
  the edge is glued.
-->
<!--
 | Copyright (c) 2021-2023 Julian Rüth <julian.rueth@fsfe.org>
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
    <g v-for="halfEdge of halfEdges" :key="halfEdge" class="click-area" @mousemove="(e) => hover(halfEdge, e)" @mouseleave="unhover()" @click="glue(halfEdge)" >
      <segment-component :segment="segment(halfEdge)" :svg="svg" />
    </g>
    <g v-for="edge of edges" :key="edge.positive" class="click-area" @mousemove="(e) => hover(edge, e)" @mouseleave="unhover()" @click="glue(edge)" >
      <segment-component :segment="segment(edge.positive)" :svg="svg" />
    </g>
  </g>
</template>
<script lang="ts">
import { mdiLinkOff, mdiLink, mdiAlert } from "@mdi/js";

import clamp from "lodash-es/clamp";
import wait from "@/wait";
import SegmentComponent from "@/components/svg/Segment.vue";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layout from "@/layout/Layout";
import LayoutOptions from "@/layout/LayoutOptions";
import HalfEdge from "@/flatsurf/HalfEdge";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Point from "@/geometry/Point";
import Polygon from "@/geometry/Polygon";
import Vector from "@/geometry/Vector";
import Edge from "@/flatsurf/Edge";
import { GlueSelection } from "@/components/interactions/IGlueInteraction";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  components: { SegmentComponent },
  name: "GlueInteraction",

  props: {
    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    },

    layout: {
      type: Object as PropType<Layout>,
      required: true
    },

    relayout: {
      type: Function as PropType<(layoutOptions?: LayoutOptions) => Promise<Layout>>,
      required: true
    },

    options: {
      type: Object as PropType<VisualizationOptions>,
      required: true
    },

    focus: {
      type: Object as PropType<Polygon | null>,
      required: true,
    },

    refocus: {
      type: Function as PropType<(focus: Polygon) => void>,
      required: true,
    }
  },

  data() {
    return {
      glued: {} as GlueSelection,
      events: [] as Array<{
      kind: "HOVER",
      id: number,
      halfEdge: HalfEdge,
      at: number
    } | {
      kind: "GLUE",
      id: number,
      edge: Edge
    }>
    }
  },

  computed: {
    halfEdges(): HalfEdge[] {
      return this.layout.triangulation.halfEdges.filter((halfEdge) => !this.layout.layout(halfEdge).inner);
    },

    edges(): Edge[] {
      return this.layout.triangulation.edges.filter((edge) => this.layout.layout(edge.positive).inner);
    }
  },

  watch: {
    events() {
      const hover = this.events.some((e) => e.kind === "HOVER");
      const glue = this.events.some((e) => e.kind === "GLUE");

      for (const edge of this.layout.triangulation.edges) {
        const icon = (() => {
          if (hover || glue) {
            if (this.glued[edge.positive] === undefined)
              return null;
            const glue = this.glued[edge.positive];
            if (glue != this.layout.layout(edge.positive).inner)
              return mdiAlert;
            return glue ? mdiLink : mdiLinkOff;
          } else {
            return null;
          }
        })();

        this.options.icon(edge.positive, icon);
        this.options.icon(edge.negative, icon);
        this.options.icon(edge, icon);

        const indicator = (() => {
          for (const e of this.events) {
            if (e.kind === "HOVER") {
              const at = clamp(e.at, 0, 1);
              if (e.halfEdge === edge.positive)
                return at;
              if (e.halfEdge === edge.negative)
                return 1 - at;
            }
          }
          return null;
        })();
        this.options.indicate(edge.positive, indicator);
        this.options.indicate(edge.negative, indicator == null ? null : 1 - indicator);

        const selected = this.events.some((e) => e.kind === "GLUE" && e.edge.positive === edge.positive);

        this.options.select(edge, selected);
        this.options.select(edge.positive, selected);
        this.options.select(edge.negative, selected);
      }
    }
  },

  methods: {
    async glue(halfEdge: Edge | HalfEdge): Promise<void> {
      if (halfEdge instanceof Edge)
        return await this.glue(halfEdge.positive);

      const edge = new Edge(halfEdge);

      const glued = {...this.glued};
      if (glued[edge.positive] === undefined)
        glued[edge.positive] = true;
      else if (glued[edge.positive] === true)
        glued[edge.positive] = false;
      else
        delete glued[edge.positive];

      this.glued = glued;

      console.assert(this.events.every((e) => e.kind !== "GLUE"), "Overlapping glue events.");

      const ev = {
        kind: "GLUE" as "GLUE",
        id: Math.random(),
        edge,
      };

      this.events = [...this.events];

      if (this.glued[edge.positive] === true && this.layout.layout(edge.positive).inner)
        return;
      if (this.glued[edge.positive] === false && !this.layout.layout(edge.positive).inner)
        return;

      this.events.push(ev);

      try {
        const previousStart = this.svg.embed(this.layout.layout(halfEdge).segment.start);
        const previousFocus = this.focus;

        const layout = await this.reglue();

        // TODO: Also don't do this if we cannot relate the coordinate systems before and after. We could possibly relate everything in the viewport coordinate system anyway. See https://github.com/flatsurf/vue-flatsurf/issues/36.
        if (previousStart != null && previousFocus != null) {
          // Move the viewport such that the selected half edge does not seem to move.
          const shift = new Vector(
              this.svg,
              new Point(this.svg, previousStart.value),
              layout.layout(halfEdge).segment.start);
          this.refocus(previousFocus.translate(shift));
        }
      } finally {
        setTimeout(() => {
          this.events = this.events.filter((e) => e.id != ev.id);
        }, 800);
      }
    },

    async reglue() {
      return this.relayout(new LayoutOptions(
        (e: Edge) => this.glued[e.positive] === undefined ? null : this.glued[e.positive],
        // TODO: Pass automorphisms here somehow. See https://github.com/flatsurf/vue-flatsurf/issues/33.
        []));
    },

    segment(halfEdge: HalfEdge) {
      return this.layout!.layout(halfEdge).segment;
    },

    hover(halfEdge: Edge | HalfEdge, e: MouseEvent): void {
      if (halfEdge instanceof Edge)
        return this.hover(halfEdge.positive, e);

      this.unhover();

      this.events.push({
        kind: "HOVER",
        id: Math.random(),
        halfEdge,
        at: this.segment(halfEdge).relativize(this.toPoint(e)),
      });
    },

    unhover() {
      this.events = this.events.filter((e) => e.kind !== "HOVER");
    },

    toPoint(e: MouseEvent) {
      let svg = this.$el;
      while (svg.tagName !== "svg")
        svg = svg.parentElement!;
      return new Point(this.svg, e.clientX - svg.getBoundingClientRect().left, e.clientY - svg.getBoundingClientRect().top);
    },

    async query(when: "now" | "changed") {
      if (when === "changed")
        await wait(this, "glued");
      return this.glued;
    },

    async force(glued: GlueSelection) {
      this.glued = glued;
      return await this.reglue();
    }
  }
});
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
