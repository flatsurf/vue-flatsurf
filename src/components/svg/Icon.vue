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
  <path class="icon" :d="icon" :transform="transform" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Point from "@/geometry/Point";
import CoordinateSystem from "@/geometry/CoordinateSystem";

@Component
export default class Segment extends Vue {
  @Prop({ required: true, type: Object }) point!: Point;
  @Prop({ required: true, type: String }) icon!: string;
  @Prop({ required: true, type: Object }) svg!: CoordinateSystem;

  // For performance reasons we compute all coordinates at once since this
  // gets called a lot.
  get coords() {
    const embedded = this.svg.embed(this.point);
    return [embedded.x, embedded.y];
  }

  get transform() {
    const width = 20;
    const height = 20;
    return `translate(${this.coords[0] - width / 2} ${this.coords[1] - height / 2})`;
  }
}
</script>
<style lang="scss" scoped>
.icon {
  stroke: transparent !important;
  stroke-width: 0px;
  fill: black;
}
</style>
