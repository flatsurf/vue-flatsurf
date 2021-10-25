<template>
  <layouter v-if="triangulation != null" :triangulation="triangulation" :layout="layout" v-slot="{ layout }" @layout="(l) => layout = l">
    <v-row>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-text>
            <v-subheader>Width</v-subheader>
            <v-slider v-model="width" :min="32" :max="8192" thumb-label="always" />
            <v-subheader>Height</v-subheader>
            <v-slider v-model="height" :min="32" :max="8192" thumb-label="always" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-8 col-12">
        <v-card v-if="layout != null && viewport != null">
          <v-card-title>
            <v-tabs v-model="tab" fixed-tabs >
              <v-tabs-slider></v-tabs-slider>
              <v-tab class="primary--text" >
                <v-icon>mdi-image</v-icon>
              </v-tab>
              <v-tab class="primary--text" >
                <v-icon>mdi-format-align-left</v-icon>
              </v-tab>
            </v-tabs>
          </v-card-title>
          <v-card-text>
            <v-tabs-items v-model="tab">
              <v-tab-item key="0">
                <v-card>
                  <v-img class="mx-auto" :src="`data:image/svg+xml;base64,${base64(svg)}`" :max-width="width" :max-height="height" />
                </v-card>
              </v-tab-item>
              <v-tab-item key="1">
                <v-card flat>
                  <v-card-text class="export" v-text="svg"></v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
            <triangulation-interaction :layout="layout" :options="options" :outer="show.includes('outer')" :inner="show.includes('triangulation')" />
            <label-interaction :layout="layout" :options="options" :outer="show.includes('outer-labels')" :numeric="show.includes('numeric-labels')" />
            <flatsurf class="render" ref="flatsurf" :triangulation="triangulation" :flow-components="flowComponents" :layout="layout" :viewportCoordinateSystem="viewport.viewportCoordinateSystem" :visualizationOptions="options" style="display: block" :style="{ 'width': `${width}px`, 'height': `${height}px` }" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </layouter>
</template>
<script lang="ts">
import { Component, Prop, Vue, Ref, Watch } from "vue-property-decorator";

import AsyncComputed from 'vue-async-computed-decorator'
import Flatsurf from "@/components/flatsurf/Flatsurf.vue";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Layouter from "@/components/Layouter";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layout from "@/layout/Layout";
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import Viewport from "@/geometry/Viewport";
import Vertical from "@/flatsurf/Vertical";

@Component({
  components: {
    Flatsurf,
    TriangulationInteraction,
    LabelInteraction,
    Layouter,
  },
})
export default class Export extends Vue {
  @Prop({ required: true, type: Array }) show!: string[];

  tab = 0;

  options = new VisualizationOptions();

  width = 1024;
  height = 1024;

  ready: string | null = null;

  viewport: Viewport | null = null;

  @Ref()
  readonly flatsurf!: Flatsurf;

  get layout() : Layout | null {
    return this.$store.state.layout;
  }

  set layout(layout: Layout | null) {
    if (this.layout !== layout)
      this.$store.commit('layout', { layout });
  }

  get triangulation() : FlatTriangulation | null {
    return this.$store.state.triangulation;
  }

  get vertical() : Vertical | null {
    return this.$store.state.vertical;
  }

  get svgCoordinateSystem(): CoordinateSystem | null {
    if (this.viewport == null)
      return null;
    if (this.layout == null)
      return null;

    this.viewport.focus(this.layout.hull);

    return this.viewport.viewportCoordinateSystem;
  }

  base64(data: string) {
    return btoa(unescape(encodeURIComponent(data)));
  }

  get flowComponents() {
    if (this.show.includes('flow-components'))
      return this.$store.state.flowComponents;
    return [];
  }

  @AsyncComputed({default: "…"})
  async svg() {
    if (this.viewport == null)
      return "…";

    if (this.layout == null)
      return "…";

    this.viewport.resize(this.width, this.height);
    this.viewport.focus(this.layout.hull);

    await this.$nextTick();

    return await this.flatsurf.svg();
  }

  @Watch("triangulation", { immediate: true })
  onTriangulationChange() {
    if (this.triangulation != null) {
      this.viewport = new Viewport(this.vertical!.coordinateSystem);
    }
  }
}
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
