<!--
  Renders objects from flatsurf as SVG.
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
  <svg v-bind="$attrs">
    <slot name="background" />
    <slot name="triangulation">
      <flat-triangulation-component v-if="layout != null" :layout="layout" :svg="svgCoordinateSystem" :options="visualizationOptions">
        <slot name="components">
          <flow-component-component v-for="(component, i) of flowComponents" :key="i" :color="palette.color(i)" :component="component" :layout="layout" :surface="triangulation" :svg="svgCoordinateSystem" />
        </slot>
      </flat-triangulation-component>
      <slot name="connections">
        <saddle-connection-component v-for="(connection, i) of saddleConnections" :key="i" :svg="svgCoordinateSystem" :layout="layout" :connection="connection" />
      </slot>
      <slot name="paths">
        <path-component v-for="(path, i) of paths" :key="i" :svg="svgCoordinateSystem" :layout="layout" :path="path" />
      </slot>
    </slot>
    <slot />
  </svg>
</template>
<script lang="ts">

import FlatTriangulation from "@/flatsurf/FlatTriangulation";

import FlowComponent from "@/flatsurf/FlowComponent";
import SaddleConnection from "@/flatsurf/SaddleConnection";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layout from "@/layout/Layout";
import VisualizationOptions from "./options/VisualizationOptions";
import Palette from "@/Palette";
import Path from "@/flatsurf/Path";
import SVGExporter from "@/export/SVGExporter";
import FlatTriangulationComponent from "@/components/flatsurf/FlatTriangulation.vue";

import FlowComponentComponent from "@/components/flatsurf/FlowComponent.vue";
import SaddleConnectionComponent from "@/components/flatsurf/SaddleConnection.vue";
import PathComponent from "@/components/flatsurf/Path.vue";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  components: {
    FlatTriangulationComponent,
    FlowComponentComponent,
    SaddleConnectionComponent,
    PathComponent,
  },

  name: "Flatsurf",

  props: {
    triangulation: {
      type: Object as PropType<FlatTriangulation>,
      required: true
    },

    layout: {
      type: Object as PropType<Layout>,
      required: true
    },

    viewportCoordinateSystem: {
      type: Object as PropType<CoordinateSystem>,
      required: true,
    },

    visualizationOptions: {
      type: Object as PropType<VisualizationOptions>,
      required: true,
    },

    // TODO: Filter depending on automorphisms, see https://github.com/flatsurf/vue-flatsurf/issues/33
    flowComponents: {
      type: Array as PropType<FlowComponent[]>,
      required: false,
      default: () => [],
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
    }
  },

  computed: {
    palette(): Palette {
      return new Palette(this.flowComponents.length);
    },

    svgCoordinateSystem(): CoordinateSystem {
      console.assert(this.viewportCoordinateSystem != null);
      return this.viewportCoordinateSystem;
    }
  },

  methods: {
    async svg() {
      await this.$nextTick();

      const exporter = new SVGExporter(this.$el);
      exporter.simplifyColors();
      exporter.dropNonStandardStyles();
      exporter.dropNonInkscapeStyles();
      exporter.dropTrivialStyles();
      exporter.dropRedundantStyles();
      exporter.dropClasses();
      exporter.dropPrefixedStyles();
      exporter.dropInvisible();
      exporter.dropInteractiveStyles();
      exporter.dropCustomAttributes();
      exporter.usePresentationAttributes();
      exporter.inlineStyles();
      return exporter.toString();
    }
  }
});
</script>
