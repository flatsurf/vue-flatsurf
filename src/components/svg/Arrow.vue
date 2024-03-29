<!--
  Renders a little arrow indicator as SVG.
-->
<!--
 | Copyright (c) 2021-2023 Julian Rüth <julian.rueth@fsfe.org>
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
	<g class="arrow">
		<line :x1="x1" :y1="y1" :x2="x2" :y2="y2" />
		<path d="M 0 -3 L 12 0 L 0 3 z" :transform="atEnd" stroke-width="0"/>
	</g>
</template>
<script lang="ts">
import Segment from "@/geometry/Segment";
import Vector from "@/geometry/Vector";
import Point from "@/geometry/Point";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "Arrow",

  props: {
    segment: {
      type: Object as PropType<Segment>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    }
  },

  computed: {
    x1(): number {
      return this.svg.embed(this.segment.start).x;
    },

    y1(): number {
      return this.svg.embed(this.segment.start).y;
    },

    endWithoutHead(): Point {
      return this.svg.embed(this.segment.end).translate(this.svg.embed(this.segment.tangentInEnd).normalize().multiply(12));
    },

    x2(): number {
      return this.svg.embed(this.endWithoutHead).x;
    },

    y2(): number {
      return this.svg.embed(this.endWithoutHead).y;
    },

    atEnd(): string {
    return `translate(${this.x2} ${this.y2}) rotate(${-this.svg.embed(this.segment).tangentInStart.angleTo(new Vector(this.svg.embed(this.segment).parent, 1, 0))*360 / (2*Math.PI)} 0 0)`;
	}
  }
});
</script>
<style scoped>
path {
  fill: #d95f02;
}
</style>
