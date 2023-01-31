<template>
  <g class="Edge">
    <g v-if="options.label" class="label">
      <segment-label :at="segment" :svg="svg">{{ options.label }}</segment-label>
    </g>
    <segment-component :class="{ selected: options.selected }" :segment="segment" :svg="svg" />
    <segment-icon v-if="options.icon" :segment="segment" :svg="svg" :icon="options.icon" />
  </g>
</template>
<script lang="ts">
import Layout from "@/layout/Layout";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import SegmentComponent from "@/components/svg/Segment.vue";
import Edge from "@/flatsurf/Edge";
import SegmentLabel from "@/components/svg/SegmentLabel.vue";
import IHalfEdgeOptions from "@/components/flatsurf/options/IHalfEdgeOptions";
import SegmentIcon from "@/components/svg/SegmentIcon.vue";
import Segment from "@/geometry/Segment";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  components: { SegmentComponent, SegmentLabel, SegmentIcon },
  name: "EdgeComponent",

  props: {
    layout: {
      type: Object as PropType<Layout>,
      required: true
    },

    edge: {
      type: Object as PropType<Edge>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    },

    options: {
      type: Object as PropType<IHalfEdgeOptions>,
      required: true,
      default: () => ({})
    }
  },

  computed: {
    segment(): Segment {
      return this.layout.layout(this.edge.positive).segment;
    }
  }
});
</script>
<style lang="scss">
.Edge {
  line {
    stroke-width: 2px;
    stroke: #ddd;
    stroke-dasharray: 8 6;
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
