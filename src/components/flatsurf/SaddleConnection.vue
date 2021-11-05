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
  <g class="SaddleConnection">
    <path-component :path="[connection]" :svg="svg" :layout="layout" :animated="animated" />
  </g>
</template>
<script lang="ts">
import Layout from '@/layout/Layout';
import { Vue, Component, Prop } from "vue-property-decorator";
import SaddleConnectionData from "@/flatsurf/SaddleConnection";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import PathComponent from "@/components/flatsurf/Path.vue";

@Component({
  components: {
    PathComponent,
  }
})
export default class SaddleConnection extends Vue {
  @Prop({ required: true }) connection!: SaddleConnectionData;
  @Prop({ required: true }) layout!: Layout;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
  @Prop({required: false, default: false, type: Boolean}) animated!: boolean;
}
</script>
<style>
.SaddleConnection {
  stroke: #d95f02;
  stroke-width: 4px;
}
</style>
