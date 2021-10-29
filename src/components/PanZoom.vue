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
  <div ref="container" @mousedown="pan = true" @mouseup="pan = false" :class="{ pan, TODO: true }">
    <slot v-if="viewport != null" v-bind:viewport="viewport" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Ref, Watch } from "vue-property-decorator";
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
  private viewport: Viewport | null = null;;

  @Ref()
  private readonly container!: HTMLElement;

  private dimensions : null | { width: number, height: number } = null;

  private resize() {
    const dimensions = this.redimension();

    if (this.viewport == null)
      throw Error("Cannot resize viewport before PanZoom has been mounted.");

    this.viewport.resize(dimensions.width, dimensions.height);
    this.refocus(this.viewport.viewport);
  }

  @Watch("value")
  refocus(focus: Box | Polygon | null) {
    if (this.viewport == null)
      throw Error("Cannot change focus in PanZoom before it has been mounted.");
  
    if (focus == null)
      return;

    if (!(focus instanceof Box && focus.equalTo(this.viewport.viewport))) {
      this.viewport.focus(focus);
      console.assert(JSON.stringify(focus) !== JSON.stringify(this.viewport.viewport), "Changing focus to %s did not modify viewport.", JSON.stringify(focus))
      if (JSON.stringify(focus) === JSON.stringify(this.viewport.viewport))
        throw Error("TODO Aborting here to break infinite loop.");
    }

    if (this.value == null || !(this.value instanceof Box && this.value.equalTo(this.viewport.viewport))) {
      this.$emit('input', this.viewport.viewport);
    }
  }

  @Watch("coordinateSystem")
  onCoordinateSystemChange() {
    this.beforeDestroy();
    this.mounted();
  }

  mounted() {
    this.unpanzoom = panzoom(this.$el, this.panzoom);
    this.observer.observe(this.container);
    const dimensions = this.redimension();
    this.viewport = new Viewport(this.coordinateSystem, dimensions.width, dimensions.height);
    this.refocus(this.value);
  }

  beforeDestroy() {
    this.unpanzoom();
    this.observer.unobserve(this.container);
    if (this.viewport != null)
      this.viewport.destroy();
    this.viewport = null;
  }

  private redimension() {
    if (this.container == null)
      throw Error("Cannot determine dimensions of PanZoom before it has been mounted.");

    this.dimensions = {
      width: Math.min(this.container.clientWidth, window.innerWidth),
      height: Math.min(this.container.clientHeight, window.innerHeight),
    };

    if (this.dimensions.width === 0)
      throw Error("PanZoom must explicitly have non-zero width.");

    if (this.dimensions.height === 0)
      throw Error("PanZoom must explicitly have non-zero height.");
    
    return this.dimensions;
  }

  private panzoom(e: any) {
    console.assert(this.viewport != null, "PanZoom cannot receive events before it has been mounted.");

    // We either zoom or pan; mixing this is probably confusing.
    if (e.dz !== 0) {
      this.viewport!.zoom(Math.exp(-e.dz/96), new Point(this.viewport!.viewportCoordinateSystem, e.x, e.y));
    } else {
      this.viewport!.focus(this.viewport!.viewport.translate(new Vector(
        this.viewport!.viewportCoordinateSystem,
        -e.dx,
        -e.dy)));
    }
    this.$emit('input', this.viewport!.viewport);
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
