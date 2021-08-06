<template>
  <g class="HalfEdge" :class="{ inner }" @click="onClick" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @mousemove="onMouseMove">
    <extended-click-area>
      <g v-if="halfEdgeConfiguration(halfEdge).state.labeled || !inner" class="label">
        <segment-label :at="segment">{{ halfEdge }}</segment-label>
      </g>
      <arrow v-if="indicator(halfEdge)" class="indicator" :segment="indicator(halfEdge)" />
      <arrow v-if="inner && indicator(-halfEdge)" class="indicator" :segment="indicator(-halfEdge)" />
      <segment-component :segment="segment" :class="{ selected, glued }" />
    </extended-click-area>
  </g>
</template>
<script lang="ts">
import { Component, Prop, Inject, Vue } from "vue-property-decorator";

import FlatTriangulationLayout from "../geometry/layout/FlatTriangulationLayout";
import Segment from "@/geometry/Segment";
import Vector from "@/geometry/Vector";
import SegmentComponent from "./svg/Segment.vue";
import HalfEdge from "@/geometry/triangulation/HalfEdge";
import SegmentLabel from "./svg/SegmentLabel.vue";
import Arrow from "./svg/Arrow.vue";

import ExtendedClickArea from "./svg/ExtendedClickArea.vue";
import { IHalfEdgeConfiguration, DefaultHalfEdgeConfiguration } from "./HalfEdgeConfiguration";

@Component({
  components: { Arrow, ExtendedClickArea, SegmentComponent, SegmentLabel },
})
export default class HalfEdgeComponent extends Vue {
  @Prop({required: true, type: Object}) surface!: FlatTriangulationLayout;
  @Prop({required: true, type: Number}) halfEdge!: HalfEdge;
  @Prop({required: true, type: Boolean}) inner!: boolean;

  onClick(ev: MouseEvent) {
    this.halfEdgeConfiguration(this.halfEdge).interactions.click(ev, this.segment);
  }

  onMouseEnter(ev: MouseEvent) {
    this.halfEdgeConfiguration(this.halfEdge).interactions.enter(ev, this.segment);
  }

  onMouseLeave(ev: MouseEvent) {
    this.halfEdgeConfiguration(this.halfEdge).interactions.leave(ev, this.segment);
  }

  onMouseMove(ev: MouseEvent) {
    this.halfEdgeConfiguration(this.halfEdge).interactions.hover(ev, this.segment);
  }

  get selected() {
    return this.halfEdgeConfiguration(this.halfEdge).state.selected;
  }

  get glued() {
    return this.halfEdgeConfiguration(this.halfEdge).state.glued;
  }

  get segment() {
    return this.surface.layout(this.halfEdge).segment;
  }

  indicator(halfEdge: HalfEdge) {
    const segment = this.surface.layout(halfEdge).segment;
    let indicator = this.halfEdgeConfiguration(halfEdge).state.indicator;
    if (indicator) {
		  const end = segment.at(indicator);
		  const start = end.translate(this.svg(segment.tangentInStart.rotate90CCW()).normalize().multiply(10));
      return new Segment(start, end);
    }
	}

  @Inject({ default: () => DefaultHalfEdgeConfiguration })
  halfEdgeConfiguration!: (halfEdge: HalfEdge) => IHalfEdgeConfiguration;

  @Inject()
  svg!: (xy: Vector) => Vector;
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

  &:hover.inner line {
    stroke: black;
  }

  .glued {
    stroke: #eee;
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
