<!--
  A composition of components that displays a widget and allows interaction
  with that surface.
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
  <layouter ref="layouter" :triangulation="parsedTriangulation" @layout="onLayout" v-slot="{ layout, relayout }">
    <viewer-component class="surface" ref="viewer" :triangulation="parsedTriangulation" :flow-components="parsedFlowComponents" :layout="layout" :vertical="parsedVertical" :saddle-connections="parsedSaddleConnections" :paths="parsedPaths">
      <template v-slot:interaction="{ focus, options, refocus, svg }">
        <triangulation-interaction :layout="layout" :options="options" :outer="showOuterHalfEdges" :inner="showInnerEdges" />
        <label-interaction :layout="layout" :options="options" :outer="showOuterLabels" :numeric="showNumericLabels" />
        <glue-interaction-component v-if="action == 'glue'" ref="glue" :relayout="relayout" :svg="svg" :options="options" :focus="focus" :refocus="refocus" :layout="layout" />
        <path-interaction-component v-if="action == 'path'" ref="path" :layout="layout" :svg="svg" :triangulation="parsedTriangulation" :options="options" :animated="animated" />
      </template>
    </viewer-component>
  </layouter>
</template>
<script lang="ts">
import YAML from "yaml";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";

import FlowComponent from "@/flatsurf/FlowComponent";
import SaddleConnection from "@/flatsurf/SaddleConnection";
import Path from "@/flatsurf/Path";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layouter from "@/components/Layouter";
import ViewerComponent from "@/components/Viewer.vue";
import IViewer from "@/components/IViewer";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";
import GlueInteractionComponent from "@/components/interactions/GlueInteraction.vue";
import PathInteractionComponent from "@/components/interactions/PathInteraction.vue";
import IPathInteraction from "@/components/interactions/IPathInteraction";
import IGlueInteraction from "@/components/interactions/IGlueInteraction";
import Vertical from "@/flatsurf/Vertical";
import {PropType, defineComponent} from "vue";

class PromisedCache<T> {
  private current!: Promise<T>;
  private setCurrent!: ((value: T) => void) | null;

  constructor() {
    this.invalidate();
  }

  get value(): Promise<T> {
    return this.current;
  }

  invalidate() {
    const oldSetCurrent = this.setCurrent;

    this.current = new Promise<T>((resolve) => {
      const setCurrent = (value: T) => {
        if (oldSetCurrent)
          oldSetCurrent(value);

        resolve(value);
        
        if (this.setCurrent === setCurrent) {
          this.setCurrent = null;
        }
      };
      this.setCurrent = setCurrent;
    });
  }

  reset(value: T) {
    if (this.setCurrent == null)
      throw Error("cannot reset cache again");

    this.setCurrent(value);
  }
}

const Widget = defineComponent({
  components: {
    Layouter,
    ViewerComponent,
    GlueInteractionComponent,
    PathInteractionComponent,
    TriangulationInteraction,
    LabelInteraction,
  },

  name: "Widget",

  props: {
    triangulation: {
      type: String as PropType<string>,
      required: true
    },

    flowComponents: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },

    saddleConnections: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },

    paths: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },

    vertical: {
      type: String as PropType<string | null>,
      required: false,
      default: null,
    },

    showInnerEdges: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },

    showOuterHalfEdges: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },

    showOuterLabels: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },

    showNumericLabels: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true
    },

    action: {
      type: String as PropType<string | null>,
      required: false,
      default: null,
    },

    animated: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    }
  },

  data() {
    return {
      coordinateSystem: new CoordinateSystem(true, "Flatsurf Coordinate System"),
      viewer: new PromisedCache<IViewer>(),
    };
  },

  computed: {
    parsedTriangulation(): FlatTriangulation {
      // Not sure why this cast is necessary.
      return FlatTriangulation.parse(YAML.parse(this.triangulation), this.coordinateSystem as CoordinateSystem);
    },

    parsedFlowComponents(): FlowComponent[] {
      // Not sure why this cast is necessary.
      return this.flowComponents.map((component) => FlowComponent.parse(YAML.parse(component), this.coordinateSystem as CoordinateSystem));
    },

    parsedSaddleConnections(): SaddleConnection[] {
      // Not sure why this cast is necessary.
      return [...this.saddleConnections].map((connection) => SaddleConnection.parse(YAML.parse(connection), this.coordinateSystem as CoordinateSystem));
    },

    parsedPaths(): Path[] {
      // Not sure why this cast is necessary.
      return [...this.paths].map((path) => Path.parse(YAML.parse(path), this.coordinateSystem as CoordinateSystem));
    },

    parsedVertical(): Vertical | null {
      if (this.vertical == null)
        return null;

      // Not sure why this cast is necessary.
      return Vertical.parse(YAML.parse(this.vertical), this.coordinateSystem as CoordinateSystem);
    },

    layouter(): typeof Layouter {
      return this.$refs.layouter as unknown as typeof Layouter;
    },
  },

  methods: {
    async svg() {
      return await (await this.viewer.value).svg();
    },

    async layout(when: "now" | "changed") {
      return await this.layouter.query(when);
    },

    async glued(when: "now" | "changed") {
      return await (await this.glueInteraction()).query(when);
    },

    async glue(glued: {[positive: number]: boolean}) {
      const layout = await (await this.glueInteraction()).force(glued);
      (await this.viewer.value).refocus();
      return layout;
    },

    async path(when: "now" | "completed" | "changed") {
      return await (await this.pathInteraction()).query(when);
    },

    async glueInteraction(): Promise<IGlueInteraction> {
      if (this.action !== "glue")
        throw Error(`Cannot access glue interaction when action is not set to 'glue' but to ${this.action}.`);

      await this.viewer.value;

      if (this.$refs.glue == null)
        throw Error("Cannot access glue interactions of this Widget yet.");

      return this.$refs.glue as unknown as IGlueInteraction;
    },

    async pathInteraction(): Promise<IPathInteraction> {
      if (this.action !== "path")
        throw Error(`Cannot access path interaction when action is not set to 'path' but to ${this.action}.`);

      await this.viewer.value;

      if (this.$refs.path == null)
        throw Error("Cannot access path interactions of this Widget yet.");

      return this.$refs.path as unknown as  IPathInteraction;
    },

    async onLayout() {
      await this.$nextTick();
      if (this.$refs.viewer != null)
        this.viewer.reset(this.$refs.viewer as IViewer);
    },
  }
});

export default Widget;
</script>
<style scoped>
.surface {
  display: inline-block;
  overflow: hidden;
  height: 640px;
  width: 100%;
}
</style>
