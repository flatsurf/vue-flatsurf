<template>
  <div ref="container" @mousedown="pan = true" @mouseup="pan = false" :class="{ pan }">
    <slot v-if="viewport != null" v-bind:viewport="viewport" />
  </div>
</template>
<script lang="ts">
import Viewport from "@/geometry/Viewport";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Point from "@/geometry/Point";
import Box from "@/geometry/Box";
import Vector from "@/geometry/Vector";
import Polygon from "@/geometry/Polygon";
import panzoom from "@thesoulfresh/pan-zoom/lib/index.js";
import { defineComponent, PropType, shallowRef } from "vue";

export default defineComponent({
  name: "PanZoom",

  props: {
    coordinateSystem: {
      type: CoordinateSystem as unknown as PropType<Readonly<CoordinateSystem>>,
      required: true
    },

    modelValue: {
      type: Object as PropType<Box | Polygon | null>,
      required: true,
    }
  },

  data() {
    return {
      observer: shallowRef(new ResizeObserver(() => {
        // TypeScript support does not deduce the correct type of this here.
        (this as any).resize();
      })),
      unpanzoom: () => {},
      pan: false,
      viewport: null as Viewport | null,
      dimensions: null as {width: number, height: number} | null,
    }
  },

  computed: {
    container(): Element {
      return this.$refs.container as Element;
    }
  },

  watch: {
    modelValue(focus: Box | Polygon | null) {
      this.refocus(focus);
    },

    coordinateSystem() {
      const focus = this.modelValue == null ? null : this.coordinateSystem.embed(this.modelValue);
      this.cleanup();
      this.initialize();
      this.refocus(focus);
    }
  },

  mounted() {
    this.unpanzoom = panzoom(this.$el, this.panzoom);
    this.observer.observe(this.container);
    this.initialize();
    this.refocus(this.modelValue);
  },

  beforeUnmount() {
    this.unpanzoom();
    this.observer.unobserve(this.container);
    this.cleanup();
  },

  methods: {
    refocus(focus: Box | Polygon | null) {
      if (this.viewport == null)
        throw Error("Cannot change focus in PanZoom before it has been mounted.");
    
      if (focus == null)
        return;

      const changed = () => {
        if (focus instanceof Box) {
          try {
            return !focus.equalTo(this.viewport!.viewport);
          } catch {
            return true;
          }
        }
        return true;
      };

      if (changed()) {
        this.viewport.focus(focus);
        console.assert(JSON.stringify(focus) !== JSON.stringify(this.viewport.viewport), "Changing focus to %s did not modify viewport.", JSON.stringify(focus))
      }

      if (this.modelValue == null || changed()) {
        this.$emit('input', this.viewport.viewport);
      }
    },
    resize() {
      const dimensions = this.redimension();

      if (this.viewport == null)
        throw Error("Cannot resize viewport before PanZoom has been mounted.");

      this.viewport.resize(dimensions.width, dimensions.height);
      this.refocus(this.viewport.viewport);
    },

    initialize() {
      const dimensions = this.redimension();
      this.viewport = new Viewport(this.coordinateSystem, dimensions.width, dimensions.height);
    },

    cleanup() {
      if (this.viewport != null)
        this.viewport.destroy();
      this.viewport = null;
    },

    redimension(): {width: number, height: number} {
      if (this.container == null)
        throw Error("Cannot determine dimensions of PanZoom before it has been mounted.");

      this.dimensions = {
        width: Math.min(this.container.clientWidth, window.innerWidth),
        height: Math.min(this.container.clientHeight, window.innerHeight),
      };

      // Work around clientWidth and clientHeight === 0 when testing.
      if (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom")) {
        this.dimensions = {
          width: 640,
          height: 480,
        };
      }

      if (this.dimensions.width === 0)
        throw Error("PanZoom must explicitly have non-zero width.");

      if (this.dimensions.height === 0)
        throw Error("PanZoom must explicitly have non-zero height.");
      
      return this.dimensions;
    },

    panzoom(e: any) {
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
});
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
