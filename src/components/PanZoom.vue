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
  <div ref="viewport" @mousedown="pan = true" @mouseup="pan = false" :class="{ pan }">
    <slot v-bind:viewport="viewport" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Viewport from "@/geometry/Viewport";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Point from "@/geometry/Point";
import Box from "@/geometry/Box";
import Vector from "@/geometry/Vector";
import Polygon from "@/geometry/Polygon";
import panzoom from "pan-zoom/index.js";

@Component
export default class PanZoom extends Vue {
  @Prop({required: true, type: CoordinateSystem}) coordinateSystem!: CoordinateSystem;
  @Prop({required: false, default: null, type: Object}) value!: Box | Polygon | null;

  private observer = new ResizeObserver(this.resize);
  private unpanzoom = () => {};
  protected pan = false;
  private viewport = null as any as Viewport;

  private resize() {
    this.viewport.resize(
      Math.min((this.$refs.viewport as HTMLElement).clientWidth, window.innerWidth),
      Math.min((this.$refs.viewport as HTMLElement).clientHeight, window.innerHeight));
    this.refocus(this.viewport.viewport);
  }

  @Watch("value")
  refocus(focus: Box | Polygon | null) {
    if (focus == null)
      return;

    if (!(focus instanceof Box && focus.equalTo(this.viewport.viewport)))
      this.viewport.focus(focus);

    if (this.value == null || !(this.value instanceof Box && this.value.equalTo(this.viewport.viewport)))
      this.$emit('input', this.viewport.viewport);
  }

  @Watch("coordinateSystem", {immediate: true})
  onCoordinateSystemChange() {
    this.viewport = new Viewport(this.coordinateSystem);
    this.refocus(this.value);
  }

  mounted() {
    this.unpanzoom = panzoom(this.$el, this.panzoom);
    this.observer.observe(this.$el);
    this.resize();
  }

  beforeDestroy() {
    this.unpanzoom();
    this.observer.unobserve(this.$el);
  }

  private panzoom(e: any) {
    // We either zoom or pan; mixing this is probably confusing.
    if (e.dz !== 0) {
      this.viewport.zoom(Math.exp(-e.dz/96), new Point(this.viewport.viewportCoordinateSystem, e.x, e.y));
    } else {
      this.viewport.focus(this.viewport.viewport.translate(new Vector(
        this.viewport.viewportCoordinateSystem,
        -e.dx,
        -e.dy)));
    }
    this.$emit('input', this.viewport.viewport);
  }
}
</script>
<style scoped>
div {
  /* So the div is no higher than the SVG it contains. */
  line-height: 0;
  cursor: grab;
}

div.pan {
  cursor: grabbing;  
}
</style>
