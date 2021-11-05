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
  <layouter ref="layouter" :triangulation="parsedTriangulation" v-slot="{ layout, relayout }">
    <viewer class="surface" ref="viewer" :triangulation="parsedTriangulation" :flow-components="parsedFlowComponents" :layout="layout" :vertical="parsedVertical">
      <template v-slot:interaction="{ focus, options, refocus, svg }">
        <triangulation-interaction :layout="layout" :options="options" :outer="showOuterHalfEdges" :inner="showInnerEdges" />
        <label-interaction :layout="layout" :options="options" :outer="showOuterLabels" :numeric="showNumericLabels" />
        <glue-interaction v-if="action == 'glue'" ref="glueInteraction" :relayout="relayout" :svg="svg" :options="options" :focus="focus" :refocus="refocus" :layout="layout" />
        <path-interaction v-if="action == 'path'" ref="pathInteraction" :layout="layout" :svg="svg" :triangulation="parsedTriangulation" :options="options" />
      </template>
    </viewer>
  </layouter>
</template>
<script lang="ts">
import { Component, Prop, Ref, Vue } from "vue-property-decorator";

import YAML from "yaml";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import FlowComponent from "@/flatsurf/FlowComponent";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layouter from "@/components/Layouter";
import Viewer from "@/components/Viewer.vue";
import IViewer from "@/components/IViewer";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";
import GlueInteraction from "@/components/interactions/GlueInteraction.vue";
import PathInteraction from "@/components/interactions/PathInteraction.vue";
import IPathInteraction from "@/components/interactions/IPathInteraction";
import IGlueInteraction from "@/components/interactions/IGlueInteraction";
import Vertical from "@/flatsurf/Vertical";
import IWidget from "@/components/IWidget";

@Component({
  components: {
    Layouter,
    Viewer,
    GlueInteraction,
    PathInteraction,
    TriangulationInteraction,
    LabelInteraction,
  },
})
export default class Widget extends Vue implements IWidget {
  @Prop({ required: true, type: String }) triangulation!: string;
  @Prop({ required: false, default: () => [], type: Array }) flowComponents!: string[];
  @Prop({ required: false, default: null, type: String }) vertical!: string | null;
  @Prop({ required: false, default: true, type: Boolean }) showInnerEdges!: boolean;
  @Prop({ required: false, default: true, type: Boolean }) showOuterHalfEdges!: boolean;
  @Prop({ required: false, default: true, type: Boolean }) showOuterLabels!: boolean;
  @Prop({ required: false, default: false, type: Boolean }) showNumericLabels!: boolean;
  @Prop({ required: false, default: null, type: String }) action!: string | null;

  coordinateSystem = new CoordinateSystem(true);

  @Ref()
  readonly viewer!: IViewer;

  get parsedTriangulation(): FlatTriangulation {
    return FlatTriangulation.parse(YAML.parse(this.triangulation), this.coordinateSystem);
  }

  get parsedFlowComponents(): FlowComponent[] {
    return this.flowComponents.map((component) => FlowComponent.parse(YAML.parse(component), this.coordinateSystem));
  }

  get parsedVertical() {
    if (this.vertical == null)
      return null;

    return Vertical.parse(YAML.parse(this.vertical), this.coordinateSystem);
  }

  async svg(): Promise<string> {
    if (this.viewer === undefined) {
      await new Promise<void>((resolve) => {
        this.layouter.$once("layout", () => resolve());
      });
      await this.$nextTick();
    }
    return await this.viewer.svg();
  }

  @Ref()
  readonly layouter!: Layouter;

  async layout(when: "now" | "changed") {
    return await this.layouter.query(when);
  }

  @Ref()
  readonly glueInteraction!: IGlueInteraction;

  async glued(when: "now" | "changed") {
    return await this.glueInteraction.query(when);
  }

  async glue(glued: {[positive: number]: boolean}) {
    const layout = await this.glueInteraction.force(glued);
    this.viewer.refocus();
    return layout;
  }

  @Ref()
  readonly pathInteraction!: IPathInteraction;

  async path(when: "now" | "completed" | "changed") {
    return await this.pathInteraction.query(when);
  }
}
</script>
<style scoped>
.surface {
  display: inline-block;
  overflow: hidden;
  height: 640px;
  width: 100%;
}
</style>
