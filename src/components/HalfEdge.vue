<template>
  <g>
    <arrow class="indicator" v-if="indicator" :segment="indicator" />
    <segment-label v-if="halfEdgeConfiguration(halfEdge).state.labeled || true" :at="segment">{{ halfEdge }}</segment-label>
    <extended-click-area @click="onClick" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @mousemove="onMouseMove">
      <segment-component :segment="segment" :class="{ selected, glued }" />
    </extended-click-area>
  </g>
</template>
<script lang="ts">
import { Component, Prop, Inject, Vue } from "vue-property-decorator";

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
  @Prop({required: true, type: Number}) halfEdge!: HalfEdge;
  // TODO: We should compute the segment here from the layout object instead.
  @Prop({required: true, type: Object}) segment!: Segment;

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

	get indicator() {
    let indicator = this.halfEdgeConfiguration(this.halfEdge).state.indicator;
    if (indicator) {
		  const end = this.segment.at(indicator);
		  const start = end.translate(this.svg(this.segment.tangentInStart.rotate90CCW()).normalize().multiply(10));
      return new Segment(start, end);
    }
	}

  @Inject({ default: () => DefaultHalfEdgeConfiguration })
  halfEdgeConfiguration!: (halfEdge: HalfEdge) => IHalfEdgeConfiguration;

  @Inject()
  svg!: (xy: Vector) => Vector;
}
</script>
<style lang="scss" scoped>
line {
  stroke: #d1d1d1;
  stroke-width: 1px;
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
</style>
