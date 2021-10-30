<!--

Displays a surface from flatsurf and related objects such as flow components.

-->
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
  <pan-zoom v-slot="{ viewport }" :coordinate-system="idealCoordinateSystem" v-model="focus">
    <flatsurf v-if="layout != null" ref="flatsurf" :width="viewport.width" :height="viewport.height" @dblclick="focus = layout.hull" :triangulation="triangulation" :layout="layout" :viewport-coordinate-system="viewport.viewportCoordinateSystem" :visualization-options="visualizationOptions" :flow-components="visibleFlowComponents">
      <slot name="interaction" v-bind:layout="layout" v-bind:svg="viewport.viewportCoordinateSystem" v-bind:triangulation="triangulation" v-bind:options="visualizationOptions" v-bind:focus="focus" v-bind:refocus="refocus" />
    </flatsurf>
  </pan-zoom>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import Layout from "@/layout/Layout";
import Polygon from "@/geometry/Polygon";
import FlowComponent from "@/flatsurf/FlowComponent"
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import FlowConnection from "@/flatsurf/FlowConnection";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Vertical from "@/flatsurf/Vertical";

import wait from "@/wait";

import PanZoom from "./PanZoom.vue";
import Flatsurf from "./flatsurf/Flatsurf.vue";
import IViewer from "./IViewer";

@Component({
  components: {
    PanZoom,
    Flatsurf,
  }
})
export default class Viewer extends Vue implements IViewer {
  @Prop({ required: true, type: Object }) triangulation!: FlatTriangulation;
  @Prop({ required: false, default: null, type: Object }) vertical!: Vertical | null;
  @Prop({ required: false, default: () => [], type: Array }) flowComponents!: FlowComponent[];
  @Prop({ required: true, type: Object }) layout!: Layout;

  protected visualizationOptions = new VisualizationOptions();

  private focus: Polygon | null = null;

  get idealCoordinateSystem() {
    return this.vertical?.coordinateSystem || this.triangulation.coordinateSystem;
  }

  // TODO: This works around a flakiness of pan-zoom. Without this the focus is sometimes not recomputed correctly, see https://github.com/flatsurf/vue-flatsurf/issues/31
  @Watch("idealCoordinateSystem")
  onCoordinateSystemChanged() {
    this.$nextTick(() => {
      this.focus = this.layout.hull;
    });
  }

  public refocus(focus?: Polygon) {
    if (focus == null)
      focus = this.layout.hull;
    if (this.focus == null || !this.focus.equalTo(focus))
      this.focus = focus;
  }

  get visibleFlowComponents() {
    return this.flowComponents.filter((component) =>
      !component.perimeter.some((connection: FlowConnection) =>
        ! this.layout.primary.includes(connection.connection.source) && !this.layout.primary.includes(connection.connection.target)
    ))
  }

  @Watch("layout", { immediate: true })
  onLayoutChanged() {
    if (this.focus == null)
      this.refocus();
  }

  async svg() {
    while (this.layout == null)
      await wait(this, "layout");

    await this.$nextTick();

    return await (this.$refs.flatsurf as any).svg();
  }
}
</script>
