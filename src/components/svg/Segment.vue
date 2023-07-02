<!--
  Renders a line segment in SVG.
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
  <line ref="line" class="segment" :class="{ animated }" :style="{'--length': length}" :x1="coords[0]" :y1="coords[1]" :x2="coords[2]" :y2="coords[3]" />
</template>
<script lang="ts">
import Segmnt from "@/geometry/Segment";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  name: "Segment",

  props: {
    segment: {
      type: Object as PropType<Segmnt>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    },

    animated: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    }
  },

  computed: {
    // For performance reasons we compute all coordinates at once since this
    // gets called a lot.
    coords(): [number, number, number, number] {
      const embedded = this.svg.embed(this.segment);
      return [embedded.start.x, embedded.start.y, embedded.end.x, embedded.end.y];
    },

    length(): number {
      const embedded = this.svg.embed(this.segment);
      return embedded.length;
    },
  },

  mounted() {
    (this.$refs.line as Element).addEventListener("animationend", () => this.$emit('animationend'));
  },
});
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
