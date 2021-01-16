<template>
  <g>
    <segment-label v-if="halfEdgeConfiguration(halfEdge).state.labeled" :at="segment">{{ halfEdge }}</segment-label>
    <extended-click-area @click="onClick" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <segment :segment="segment" :class="{ selected, glued }" />
    </extended-click-area>
  </g>
</template>
<script lang="ts">
import { Component, Prop, Inject, Vue } from "vue-property-decorator";

import Segmnt from "@/geometry/Segment";
import Segment from "./svg/Segment.vue";
import HalfEdg from "@/geometry/triangulation/HalfEdge";
import SegmentLabel from "./svg/SegmentLabel.vue";

import ExtendedClickArea from "./svg/ExtendedClickArea.vue";

@Component({
  components: { ExtendedClickArea, Segment, SegmentLabel },
})
export default class HalfEdge extends Vue {
  @Prop({required: true, type: Number}) halfEdge!: HalfEdg;
  @Prop({required: true, type: Object}) segment!: Segmnt;

  onClick() {
    this.halfEdgeConfiguration(this.halfEdge).interactions.click();
  }

  onMouseEnter() {
    this.halfEdgeConfiguration(this.halfEdge).interactions.enter();
  }

  onMouseLeave() {
    this.halfEdgeConfiguration(this.halfEdge).interactions.leave();
  }

  get selected() {
    return this.halfEdgeConfiguration(this.halfEdge).state.selected;
  }

  get glued() {
    return this.halfEdgeConfiguration(this.halfEdge).state.glued;
  }

  @Inject({ default: (_halfEdge: HalfEdge) => {
    return {
      interactions: {
        click: () => {},
        enter: () => {},
        leave: () => {},
      },
    }
  }})
  halfEdgeConfiguration: any;
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
  animation: dash 1000ms linear;
}

@keyframes dash {
  to { stroke-dashoffset: 25; }
}
</style>
