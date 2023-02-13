<template>
  <layouter v-if="triangulation != null" :triangulation="triangulation" v-slot="{ layout }" @layout="onLayout">
    <v-row>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-text>
            <!-- TODO
            <v-subheader>Width</v-subheader>
            <v-slider v-model="width" :min="32" :max="8192" thumb-label="always" />
            <v-subheader>Height</v-subheader>
            <v-slider v-model="height" :min="32" :max="8192" thumb-label="always" />
            -->
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-8 col-12">
        <v-card v-if="layout != null && viewport != null">
          <!-- TODO
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
        -->
          <v-card-text>
            <!-- TODO
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
          -->
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
import Flatsurf from "@/components/flatsurf/Flatsurf.vue";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Layouter from "@/components/Layouter";
import Viewport from "@/geometry/Viewport";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Vertical from "@/flatsurf/Vertical";
import FlowComponent from "@/flatsurf/FlowComponent";
import Layout from "@/layout/Layout";
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  components: {
    Flatsurf,
    TriangulationInteraction,
    LabelInteraction,
    Layouter,
  },

  name: "Export",

  props: {
    show: {
      type: Array as PropType<string[]>,
      required: true
    }
  },

  data() {
    return {
      tab: 0,
      options: new VisualizationOptions(),
      width: 1024,
      height: 1024,
      viewport: null as Viewport | null,
      svg: null as string | null
    }
  },

  computed: {
    triangulation(): null | FlatTriangulation {
      return this.$store.state.triangulation;
    },

    vertical(): Vertical | null {
      return this.$store.state.vertical;
    },

    svgCoordinateSystem(): CoordinateSystem | null {
      if (this.viewport == null)
        return null;

      return this.viewport.viewportCoordinateSystem as CoordinateSystem;
    },

    flowComponents(): FlowComponent[] {
      if (this.show.includes('flow-components'))
        return this.$store.state.flowComponents || [];
      return [];
    },
  },

  watch: {
    triangulation: {
      immediate: true,

      handler() {
        if (this.triangulation != null) {
          this.viewport = new Viewport(this.vertical!.coordinateSystem);
        }
      }
    }
  },

  asyncComputed: {
    // TODO: Use VueUse.computedAsync instead.
    async svg(): Promise<string> {
      if (this.viewport == null)
        return "…";

      this.viewport.resize(this.width, this.height);

      await this.$nextTick();

      return await (this.$refs.flatsurf as any).svg();
    },
  },

  methods: {
    base64(data: string) {
      return btoa(unescape(encodeURIComponent(data)));
    },
    onLayout(layout: Layout) {
      if (this.viewport == null)
        throw Error("viewport must have been created when layout is computed");
      this.viewport.focus(layout.hull);
    },
  }
});
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