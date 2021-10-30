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
  <g class="Edge">
    <g v-if="options.label" class="label">
      <segment-label :at="segment" :svg="svg">{{ options.label }}</segment-label>
    </g>
    <segment-component :class="{ selected: options.selected }" :segment="segment" :svg="svg" />
    <segment-icon v-if="options.icon" :segment="segment" :svg="svg" :icon="options.icon" />
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Layout from "@/layout/Layout";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import SegmentComponent from "@/components/svg/Segment.vue";
import Edge from "@/flatsurf/Edge";
import SegmentLabel from "@/components/svg/SegmentLabel.vue";
import IHalfEdgeOptions from "@/components/flatsurf/options/IHalfEdgeOptions";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import SegmentIcon from "@/components/svg/SegmentIcon.vue";

@Component({
  components: { SegmentComponent, SegmentLabel, SegmentIcon },
})
export default class EdgeComponent extends Vue {
  @Prop({required: true, type: Object}) layout!: Layout;
  @Prop({required: true, type: Object}) edge!: Edge;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
  @Prop({required: false, type: Object, default: () => new VisualizationOptions().get(new Edge(1)) }) options!: IHalfEdgeOptions; 

  get segment() {
    return this.layout.layout(this.edge.positive).segment;
  }
}
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
