<!--
  Renders a visually unglued half edge of a surface for SVG.
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
  <g class="HalfEdge">
    <g v-if="options.label" class="label">
      <segment-label :at="segment" :svg="svg">{{ options.label }}</segment-label>
    </g>
    <arrow v-if="indicatorPosition" class="indicator" :segment="indicatorPosition" :svg="svg" />
    <arrow v-if="sourceIndicator" class="source" :segment="source" :svg="svg" />
    <segment-component :class="{ selected: options.selected }" :segment="segment" :svg="svg" />
    <segment-icon v-if="options.icon" :segment="segment" :svg="svg" :icon="options.icon" />
  </g>
</template>
<script lang="ts">
import Layout from "@/layout/Layout";

import Segment from "@/geometry/Segment";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import SegmentComponent from "@/components/svg/Segment.vue";
import HalfEdge from "@/flatsurf/HalfEdge";
import SegmentLabel from "@/components/svg/SegmentLabel.vue";
import Arrow from "@/components/svg/Arrow.vue";
import IHalfEdgeOptions from "@/components/flatsurf/options/IHalfEdgeOptions";
import SegmentIcon from "@/components/svg/SegmentIcon.vue";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  components: { Arrow, SegmentComponent, SegmentLabel, SegmentIcon },
  name: "HalfEdgeComponent",

  props: {
    layout: {
      type: Object as PropType<Layout>,
      required: true
    },

    halfEdge: {
      type: Number as PropType<HalfEdge>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    },

    sourceIndicator: {
      type: Boolean as PropType<boolean>,
      required: true,
    },

    options: {
      type: Object as PropType<IHalfEdgeOptions>,
      required: true,
    }
  },

  computed: {
    segment(): Segment {
      return this.layout.layout(this.halfEdge).segment;
    },

    source(): Segment {
      const segment = this.segment;
          const end = segment.at(0);
          const start = end.translate(this.svg.embed(segment.tangentInStart.rotate90CCW()).normalize().multiply(10));
      return new Segment(start, end);
    },

    indicatorPosition(): Segment | null {
      const segment = this.layout.layout(this.halfEdge).segment;
      let indicator = this.options.indicator;
      if (indicator == null)
        return null;

      const end = segment.at(indicator);
      const start = end.translate(this.svg.embed(segment.tangentInStart.rotate90CCW()).normalize().multiply(10));
      return new Segment(start, end);
    },
  },
});
</script>
<style lang="scss">
.HalfEdge {
  line {
    stroke: #d1d1d1;
    stroke-width: 2px;
  }

  .indicator path {
    fill: #d95f02;
  }

  .source path {
    fill: black;
  }

  .selected {
    stroke: #ff9800;
    stroke-width: 2px;
    stroke-dasharray: 10;
    animation: dash 1000ms linear infinite;
  }

  @keyframes dash {
    to { stroke-dashoffset: 20; }
  }
}
</style>
