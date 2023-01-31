<template>
  <g class="interaction" @mousedown.prevent.stop="(e) => $emit('mousedown', e)" @click="(e) => $emit('click', e)" @mouseenter="(e) => $emit('mouseenter', e)" @mouseleave="(e) => $emit('mouseleave', e)" @mousemove="(e) => $emit('mousemove', e)" >
    <segment-component :segment="segment" :svg="svg" />
  </g>
</template>
<script lang="ts">
import HalfEdge from "@/flatsurf/HalfEdge";

import Layout from "@/layout/Layout";
import SegmentComponent from "./svg/Segment.vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Segment from "@/geometry/Segment";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  components: { SegmentComponent },
  name: "HalFEdgeInteraction",

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
    }
  },

  computed: {
    segment(): Segment {
      return this.layout.layout(this.halfEdge).segment;
    }
  }
});
</script>
<style lang="scss" scoped>
.interaction * {
  visibility: hidden !important;
  stroke-width: 30px !important;
  stroke-linejoin: round !important;
  stroke-linecap: butt !important;
  stroke-dasharray: 0 !important;
  pointer-events: all !important;
  cursor: pointer;
}
</style>
