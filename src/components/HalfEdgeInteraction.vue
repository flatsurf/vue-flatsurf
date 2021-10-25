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
  <g class="interaction" @mousedown.prevent.stop="(e) => $emit('mousedown', e)" @click="(e) => $emit('click', e)" @mouseenter="(e) => $emit('mouseenter', e)" @mouseleave="(e) => $emit('mouseleave', e)" @mousemove="(e) => $emit('mousemove', e)" >
    <segment-component :segment="segment" :svg="svg" />
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import HalfEdge from "@/flatsurf/HalfEdge";
import Layout from "@/layout/Layout";
import SegmentComponent from "./svg/Segment.vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";

@Component({
  components: { SegmentComponent },
})
export default class HalFEdgeInteraction extends Vue {
  @Prop({required: true, type: Object}) layout!: Layout;
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
