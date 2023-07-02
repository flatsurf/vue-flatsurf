<!--
  Displays a surface from flatsurf and related objects such as flow components.
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
  <pan-zoomable v-if="focus != null" v-slot="{ viewport }" :coordinate-system="idealCoordinateSystem" v-model="focus">
    <flatsurf ref="flatsurf" :width="viewport.width" :height="viewport.height" @dblclick="focus = layout.hull" :triangulation="triangulation" :layout="layout" :viewport-coordinate-system="viewport.viewportCoordinateSystem" :visualization-options="visualizationOptions" :flow-components="visibleFlowComponents" :saddle-connections="saddleConnections" :paths="paths">
      <slot name="interaction" v-bind:layout="layout" v-bind:svg="viewport.viewportCoordinateSystem" v-bind:triangulation="triangulation" v-bind:options="visualizationOptions" v-bind:focus="focus" v-bind:refocus="refocus" />
    </flatsurf>
  </pan-zoomable>
</template>
<script lang="ts">
import Layout from "@/layout/Layout";

import Polygon from "@/geometry/Polygon";
import FlowComponent from "@/flatsurf/FlowComponent"
import SaddleConnection from "@/flatsurf/SaddleConnection";
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import FlowConnection from "@/flatsurf/FlowConnection";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Vertical from "@/flatsurf/Vertical";
import Path from "@/flatsurf/Path";
import wait from "@/wait";

import PanZoomable from "./PanZoomable.vue";

import Flatsurf from "@/components/flatsurf/Flatsurf.vue";
import {defineComponent, PropType} from "vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";

export default defineComponent({
  components: {
    PanZoomable,
    Flatsurf,
  },

  name: "Viewer",

  props: {
    triangulation: {
      type: Object as PropType<FlatTriangulation>,
      required: true
    },

    vertical: {
      type: Object as PropType<Vertical | null>,
      required: false,
      default: null,
    },

    flowComponents: {
      type: Array as PropType<FlowComponent[]>,
      required: false,
      default: () => []
    },

    saddleConnections: {
      type: Array as PropType<SaddleConnection[]>,
      required: false,
      default: () => [],
    },

    paths: {
      type: Array as PropType<Path[]>,
      required: false,
      default: () => [],
    },

    layout: {
      type: Object as PropType<Layout>,
      required: true
    }
  },

  data() {
    return {
      visualizationOptions: new VisualizationOptions(),
      focus: null as Polygon | null,
    };
  },

  computed: {
    idealCoordinateSystem(): CoordinateSystem {
      return this.vertical?.coordinateSystem || this.triangulation.coordinateSystem;
    },

    visibleFlowComponents(): FlowComponent[] {
      return this.flowComponents.filter((component) =>
        !component.perimeter.some((connection: FlowConnection) =>
          ! this.layout.primary.includes(connection.connection.source) && !this.layout.primary.includes(connection.connection.target)
      ))
    }
  },

  watch: {
    idealCoordinateSystem() {
      this.$nextTick(() => {
        this.focus = this.layout.hull;
      });
    },

    layout: {
      immediate: true,

      handler() {
        if (this.focus == null)
          this.refocus();
      }
    }
  },

  methods: {
    refocus(focus?: Polygon) {
      if (focus == null)
        focus = this.layout.hull;
      if (this.focus == null || !this.focus.equalTo(focus))
        this.focus = focus;
    },

    async svg() {
      while (this.layout == null)
        await wait(this, "layout");

      await this.$nextTick();

      return await (this.$refs.flatsurf as any).svg();
    }
  }
});
</script>
