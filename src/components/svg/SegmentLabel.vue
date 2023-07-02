<!--
  Renders a label next to a segment in SVG.
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
	<g :transform="transformation">
		<text><slot/></text>
	</g>
</template>
<script lang="ts">
import Segment from "@/geometry/Segment";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: "HalfEdgeLabel",

    props: {
        at: {
            type: Object as PropType<Segment>,
            required: true
        },

        svg: {
            type: Object as PropType<CoordinateSystem>,
            required: true
        }
    },

    computed: {
        position(): {x: number, y: number} {
            const midpoint = this.at.middle;
            let normal = this.svg.embed(this.at.tangentInStart.rotate90CCW()).normalize();
            return this.svg.embed(midpoint).translate(normal.multiply(12));
        },

        transformation(): string {
            return `translate(${this.position.x} ${this.position.y}) translate(6 4)`;
        }
    }
});
</script>
<style lang="scss" scoped>
text {
    font-size: small;
    text-anchor: end;
    font-weight: 600;
    user-select: none;
    font-family: monospace;
}
</style>
