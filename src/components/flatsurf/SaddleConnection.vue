<!--
  Displays a saddle connection in a surface as SVG.
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
  <g class="SaddleConnection">
    <path-component :path="[connection]" :svg="svg" :layout="layout" :animated="animated" />
  </g>
</template>
<script lang="ts">
import Layout from '@/layout/Layout';
import SaddleConnectionData from "@/flatsurf/SaddleConnection";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import PathComponent from "@/components/flatsurf/Path.vue";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  components: {
    PathComponent,
  },

  name: "SaddleConnection",

  props: {
    connection: {
      type: Object as PropType<SaddleConnectionData>,
      required: true
    },

    layout: {
      type: Object as PropType<Layout>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    },

    animated: {
      type: Boolean,
      required: false,
      default: false
    }
  }
});
</script>
<style>
.SaddleConnection {
  stroke: #d95f02;
  stroke-width: 4px;
}
</style>
