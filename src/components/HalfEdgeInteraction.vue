<template>
  <g class="interaction" @mousedown.prevent.stop="(e) => $emit('mousedown', e)" @click="(e) => $emit('click', e)" @mouseenter="(e) => $emit('mouseenter', e)" @mouseleave="(e) => $emit('mouseleave', e)" @mousemove="(e) => $emit('mousemove', e)" >
    <segment-component :segment="segment" :svg="svg" />
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import HalfEdge from "@/flatsurf/HalfEdge";
import FlatTriangulationLayout from "@/layout/FlatTriangulationLayout";
import SegmentComponent from "./svg/Segment.vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";

@Component({
  components: { SegmentComponent },
})
export default class HalFEdgeInteraction extends Vue {
  @Prop({required: true, type: Object}) layout!: FlatTriangulationLayout;
  @Prop({required: true, type: Number}) halfEdge!: HalfEdge;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;

  get segment() {
    return this.layout.layout(this.halfEdge).segment;
  }
}
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
