<!--
  A view that can be panned and zoomed with the pointer device.
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
  <div ref="container" @mousedown="pan = true" @mouseup="pan = false" :class="{ pan }">
    <slot v-if="panzoom" v-bind:viewport="panzoom.viewport" />
  </div>
</template>
<script setup lang="ts">
import CoordinateSystem from "@/geometry/CoordinateSystem";
import type Box from "@/geometry/Box";
import type Polygon from "@/geometry/Polygon";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import type { PropType, Ref } from "vue";
import PanZoom from "@/geometry/PanZoom";
import panzoomit from "@thesoulfresh/pan-zoom/lib/index.js";

const props = defineProps({
  coordinateSystem: {
    type: Object as PropType<CoordinateSystem>,
    required: true
  },

  modelValue: {
    type: Object as PropType<Box | Polygon>,
    required: true,
  }
});

const emit = defineEmits(["update:modelValue"]);

const pan = ref(false);

const container = ref(null) as unknown as Ref<Element>;

let panzoom = null as PanZoom | null;
let observer = new ResizeObserver(() => {
  if (panzoom != null) {
    panzoom.resize(...getDimensions())
    emit("update:modelValue", panzoom.viewport.viewport);
  }
});
let unpanzoom = () => {};

const getDimensions = () => {
  if (container.value == null)
    throw Error("Cannot determine dimensions of PanZoom before it has been mounted.");

  let dimensions = [
    Math.min(container.value.clientWidth, window.innerWidth),
    Math.min(container.value.clientHeight, window.innerHeight),
  ] as [number, number];

  // Work around clientWidth and clientHeight === 0 when unit testing.
  if (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom")) {
    dimensions = [640, 480];
  }

  if (dimensions[0] === 0)
    throw Error("PanZoom must explicitly have non-zero width.");

  if (dimensions[0] === 0)
    throw Error("PanZoom must explicitly have non-zero height.");
  
  return dimensions;
};

const focus = (focus: Box | Polygon | null) => {
  if (panzoom!.focus(focus || props.modelValue) || focus == null)
    emit("update:modelValue", panzoom!.viewport.viewport);
};

const initialize = (focused: Box | Polygon | null) => {
  unpanzoom = panzoomit(container.value, (e: any) => {
    panzoom!.panzoom(e.x, e.y, e.dx, e.dy, e.dz);
    emit("update:modelValue", panzoom!.viewport.viewport);
  });
  observer.observe(container.value);
  panzoom = new PanZoom(props.coordinateSystem, getDimensions());
  focus(focused);
};

const destroy = () => {
  unpanzoom();
  observer.unobserve(container.value);
  panzoom!.destroy();
  panzoom = null;
};

onMounted(() => initialize(null));

onBeforeUnmount(() => destroy());

watch(() => props.modelValue, focus);

watch(() => props.coordinateSystem, () => {
  // We assume that the new and the old coordinate system are reated. Otherwise,
  // this entire components needs to be recreated.
  const focused = props.coordinateSystem.embed(panzoom!.viewport.viewport);
  destroy();
  initialize(focused);
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
