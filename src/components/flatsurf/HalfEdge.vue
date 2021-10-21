<template>
  <g class="HalfEdge" :class="{ inner }">
    <g v-if="options.label" class="label">
      <segment-label :at="segment" :svg="svg">{{ options.label }}</segment-label>
    </g>
    <arrow v-if="options.indicator != null" class="indicator" :segment="indicatorPosition(halfEdge)" :svg="svg" />
    <!-- TODO: half-edge should not be responsible for -halfEdge, i.e., create an Edge.vue component instead. -->
    <arrow v-if="inner && options.indicator != null" class="indicator" :segment="indicatorPosition(-halfEdge)" :svg="svg" />
    <arrow v-if="sourceIndicator" class="source" :segment="source" :svg="svg" />
    <segment-component :class="{ selected: options.selected }" :segment="segment" :svg="svg" />
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import FlatTriangulationLayout from "@/layout/FlatTriangulationLayout";
import Segment from "@/geometry/Segment";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import SegmentComponent from "@/components/svg/Segment.vue";
import HalfEdge from "@/flatsurf/HalfEdge";
import SegmentLabel from "@/components/svg/SegmentLabel.vue";
import Arrow from "@/components/svg/Arrow.vue";
import IHalfEdgeOptions from "@/components/flatsurf/options/IHalfEdgeOptions";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";

@Component({
  components: { Arrow, SegmentComponent, SegmentLabel },
})
export default class HalfEdgeComponent extends Vue {
  @Prop({required: true, type: Object}) layout!: FlatTriangulationLayout;
  @Prop({required: true, type: Number}) halfEdge!: HalfEdge;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
  @Prop({required: true, type: Boolean}) inner!: boolean;
  @Prop({required: false, type: Boolean, default: false}) sourceIndicator!: boolean;
  @Prop({required: false, type: Object, default: () => new VisualizationOptions().get(1) }) options!: IHalfEdgeOptions; 

  get segment() {
    return this.layout.layout(this.halfEdge).segment;
  }

  indicatorPosition(halfEdge: HalfEdge) {
    const segment = this.layout.layout(halfEdge).segment;
    let indicator = halfEdge === this.halfEdge ? this.options.indicator! : 1-this.options.indicator!;
    if (indicator != null) {
		  const end = segment.at(indicator);
		  const start = end.translate(this.svg.embed(segment.tangentInStart.rotate90CCW()).normalize().multiply(10));
      return new Segment(start, end);
    }
	}

  get source() {
    const segment = this.segment;
		const end = segment.at(0);
		const start = end.translate(this.svg.embed(segment.tangentInStart.rotate90CCW()).normalize().multiply(10));
    return new Segment(start, end);
  }
}
</script>
<style lang="scss">
.HalfEdge {
  line {
    stroke: #d1d1d1;
    stroke-width: 2px;
  }

  &.inner line {
    display: var(--flat-triangulation-hover, none);
    stroke: #ddd;
    stroke-dasharray: 8 6;
  }

  /* TODO: Rewrite to react to JS instead.
  &:hover.inner line {
    stroke: black;
  }
  */

  .glued {
    stroke: #eee;
  }

  .indicator path {
    fill: #d95f02;
  }

  .source path {
    fill: black;
  }

  .selected {
    stroke: red;
    stroke-width: 2px;
    stroke-dasharray: 10;
    animation: dash 1000ms linear infinite;
  }

  @keyframes dash {
    to { stroke-dashoffset: 20; }
  }
}
</style>
