<!--
  Displays a rendering of a surfaces in SVG.
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
  <layouter v-if="triangulation != null" :triangulation="triangulation" v-slot="{ layout }" @layout="onLayout">
    <v-row>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-text>
            <v-card-subtitle>Width</v-card-subtitle>
            <v-slider v-model="width" :min="32" :max="8192" thumb-label="always" />
            <v-card-subtitle>Height</v-card-subtitle>
            <v-slider v-model="height" :min="32" :max="8192" thumb-label="always" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-8 col-12">
        <v-card v-if="layout != null && viewport != null">
          <v-card-title>
            <v-tabs v-model="tab" fixed-tabs >
              <v-tab class="primary--text" >
                <v-icon>mdi-image</v-icon>
              </v-tab>
              <v-tab class="primary--text" >
                <v-icon>mdi-format-align-left</v-icon>
              </v-tab>
            </v-tabs>
          </v-card-title> 
          <v-card-text>
            <v-window v-model="tab">
              <v-window-item value="0">
                <v-card>
                  <v-img class="mx-auto" :src="`data:image/svg+xml;base64,${base64(svg)}`" :max-width="width" :max-height="height" />
                </v-card>
              </v-window-item>
              <v-window-item value="1">
                <v-card flat>
                  <v-card-text class="export" v-text="svg"></v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
            <!-- render triangulation offscreen -->
            <triangulation-interaction :layout="layout" :options="options" :outer="show.includes('outer')" :inner="show.includes('triangulation')" />
            <label-interaction :layout="layout" :options="options" :outer="show.includes('outer-labels')" :numeric="show.includes('numeric-labels')" />
            <flatsurf class="render" ref="flatsurf" :triangulation="triangulation" :flow-components="flowComponents" :layout="layout" :viewportCoordinateSystem="viewport.viewportCoordinateSystem" :visualizationOptions="options" style="display: block" :style="{ 'width': `${width}px`, 'height': `${height}px` }" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </layouter>
</template>
<script setup lang="ts">
import Flatsurf from "@/components/flatsurf/Flatsurf.vue";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Layouter from "@/components/Layouter";
import Viewport from "@/geometry/Viewport";
import Vertical from "@/flatsurf/Vertical";
import FlowComponent from "@/flatsurf/FlowComponent";
import Layout from "@/layout/Layout";
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import { computed, PropType, ref, watch, nextTick } from "vue";
import type { Ref } from "vue";
import { useStore } from "vuex";
import { computedAsync } from "@vueuse/core";

const props = defineProps({
  show: {
    type: Array as PropType<string[]>,
    required: true
  }
})

const tab = ref(0);
const options = ref(new VisualizationOptions());
const width = ref(1024);
const height = ref(1024);
const viewport = ref(null) as Ref<Viewport | null>;

const flatsurf = ref();

const store = useStore();

const triangulation = computed(() => {
  return store.state.triangulation as null | FlatTriangulation;
});

const vertical = computed(() => {
  return store.state.vertical as Vertical | null
});

const flowComponents = computed(() => {
  if (props.show.includes('flow-components'))
    return store.state.flowComponents || [] as FlowComponent[]
  return [];
});


watch(triangulation, () => {
  if (triangulation != null) {
    viewport.value = new Viewport(vertical.value!.coordinateSystem);
  }
}, { immediate: true });


const svg = computedAsync(
  async () => {
    if (viewport.value == null)
      return "…";

    viewport.value!.resize(width.value, height.value);

    await nextTick();

    return await (flatsurf.value as any).svg();
  },
);

function base64(data: string) {
  return btoa(data);
};

function onLayout(layout: Layout) {
  if (viewport == null)
    throw Error("viewport must have been created when layout is computed");
  viewport.value!.focus(layout.hull);
};
</script>
<style scoped>
.export { 
  font-family: monospace;
  font-size: 6pt;
  line-height: 1.4;
}

.render {
  position: absolute; 
  left: -999em;
}
</style>
