<template>
  <div ref="viewport" @mousedown="onMouseDown" @mouseup="onMouseUp" :class="{ pan }">
    <slot v-bind:viewport="viewport" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Viewport from "../geometry/Viewport";
import CoordinateSystem from "../geometry/CoordinateSystem";
import Point from "../geometry/Point";
import Box from "../geometry/Box";
import panzoom from "pan-zoom/index.js";

@Component
export default class PanZoom extends Vue {
  @Prop({required: true, type: CoordinateSystem}) coordinateSystem!: CoordinateSystem;
  @Prop({required: false, default: null, type: Box}) value!: Box | null;

  private observer = new ResizeObserver(this.resize);
  private unpanzoom = () => {};
  protected pan = false;
  private viewport = null as any as Viewport;

  private resize() {
    this.viewport.resize(
      Math.min((this.$refs.viewport as HTMLElement).clientWidth, window.innerWidth),
      Math.min((this.$refs.viewport as HTMLElement).clientHeight, window.innerHeight));
  }

  @Watch("value")
  refocus() {
    if (this.value != null)
      this.viewport.focus(this.value); 
  }

  @Watch("coordinateSystem", {immediate: true})
  onCoordinateSystemChange() {
    this.viewport = new Viewport(this.coordinateSystem);
    this.refocus();
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

  onMouseDown() {
    this.pan = true;
  }

  onMouseUp() {
    this.pan = false;
  }

  private panzoom(e: any) {
    // We either zoom or pan; mixing this is probably confusing.
    if (e.dz !== 0) {
      this.viewport.zoom(Math.exp(-e.dz/96), new Point(this.viewport.viewportCoordinateSystem, e.x, e.y));
    } else {
      this.viewport.focus(this.viewport.viewport.translate(-e.dx, -e.dy));
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
