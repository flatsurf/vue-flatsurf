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
  <line ref="line" class="segment" :class="{ animated }" :style="{'--length': length}" :x1="coords[0]" :y1="coords[1]" :x2="coords[2]" :y2="coords[3]" />
</template>
<script lang="ts">
import { Component, Ref, Prop, Vue, Watch } from "vue-property-decorator";

import Segmnt from "@/geometry/Segment";
import CoordinateSystem from "@/geometry/CoordinateSystem";

@Component
export default class Segment extends Vue {
  @Prop({ required: true, type: Object }) segment!: Segmnt;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
  @Prop({required: false, type: Boolean, default: false}) animated!: boolean;

  @Ref()
  line!: SVGLineElement;

  readonly onAnimationEnd = () => this.$emit("animationend");

  @Watch("animated")
  onAnimated() {
    if (this.animated)
      this.line.addEventListener("animationend", this.onAnimationEnd);
    else
      this.line.removeEventListener("animationend", this.onAnimationEnd);
  }

  mounted() {
    this.onAnimated();
  }

  // For performance reasons we compute all coordinates at once since this
  // gets called a lot.
  get coords() {
    const embedded = this.svg.embed(this.segment);
    return [embedded.start.x, embedded.start.y, embedded.end.x, embedded.end.y];
  }

  get length() {
    const embedded = this.svg.embed(this.segment);
    return embedded.length;
  }

}
</script>
<style lang="scss" scoped>
.animated {
  stroke-dasharray: var(--length);
  stroke-dashoffset: var(--length);
  animation: segment-dash .8s linear forwards;
}

@keyframes segment-dash {
  to {
    stroke-dashoffset: 0;
  }
}

</style>
