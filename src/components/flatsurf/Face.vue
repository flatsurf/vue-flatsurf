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
  <ngon :vertices="vertices" :svg="svg" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Point from "@/geometry/Point";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Ngon from "@/components/svg/Ngon.vue";

@Component({
  components: { Ngon }
})
export default class Face extends Vue {
  @Prop({ required: true, type: Array }) vertices!: Point[];
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
}
</script>
<style lang="scss" scoped>
polygon {
	stroke: transparent;
	stroke-width: 0px;
	fill: rgba(lightcyan, .5);
}
</style>
