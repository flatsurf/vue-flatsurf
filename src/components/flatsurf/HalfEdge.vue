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
  <g class="HalfEdge">
    <g v-if="options.label" class="label">
      <segment-label :at="segment" :svg="svg">{{ options.label }}</segment-label>
    </g>
    <arrow v-if="options.indicator != null" class="indicator" :segment="indicatorPosition(halfEdge)" :svg="svg" />
    <arrow v-if="sourceIndicator" class="source" :segment="source" :svg="svg" />
    <segment-component :class="{ selected: options.selected }" :segment="segment" :svg="svg" />
    <segment-icon v-if="options.icon" :segment="segment" :svg="svg" :icon="options.icon" />
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Layout from "@/layout/Layout";
import Segment from "@/geometry/Segment";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import SegmentComponent from "@/components/svg/Segment.vue";
import HalfEdge from "@/flatsurf/HalfEdge";
import SegmentLabel from "@/components/svg/SegmentLabel.vue";
import Arrow from "@/components/svg/Arrow.vue";
import IHalfEdgeOptions from "@/components/flatsurf/options/IHalfEdgeOptions";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import SegmentIcon from "@/components/svg/SegmentIcon.vue";

@Component({
  components: { Arrow, SegmentComponent, SegmentLabel, SegmentIcon },
})
export default class HalfEdgeComponent extends Vue {
  @Prop({required: true, type: Object}) layout!: Layout;
  @Prop({required: true, type: Number}) halfEdge!: HalfEdge;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
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
