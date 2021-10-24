<!--

Visualizes a Surface.

-->
<template>
  <layouter v-if="$store.state.triangulation != null" :triangulation="$store.state.triangulation" :layout="$store.state.layout" v-slot="{ layout, relayout }" @layout="layoutChanged">
    <viewer-component class="surface" :triangulation="$store.state.triangulation" :flow-components="flowComponents" :layout="layout">
      <template v-slot:interaction="{ svg, triangulation, options, refocus, focus }">
        <g v-if="layout != null">
          <triangulation-interaction :layout="layout" :options="options" :outer="show.includes('outer')" :inner="show.includes('triangulation')" />
          <label-interaction :layout="layout" :options="options" :outer="show.includes('outer-labels')" :numeric="show.includes('numeric-labels')" />
          <path-interaction v-if="action == 'path'" :layout="layout" :svg="svg" :triangulation="triangulation" :options="options" />
          <glue-interaction v-else-if="action == 'glue'" :relayout="relayout" :svg="svg" :options="options" :focus="focus" :refocus="refocus" :layout="layout" />
        </g>
      </template>
    </viewer-component>
  </layouter>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ViewerComponent from "@/components/Viewer.vue";
import GlueInteraction from "@/components/interactions/GlueInteraction.vue";
import PathInteraction from "@/components/interactions/PathInteraction.vue";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";
import Layouter from "@/components/Layouter";
import Layout from "@/layout/Layout";

@Component({
  components: {
    ViewerComponent,
    GlueInteraction,
    PathInteraction,
    TriangulationInteraction,
    LabelInteraction,
    Layouter,
  }
})
export default class Viewer extends Vue {
  @Prop({ required: true, type: String }) action!: string;
  @Prop({ required: true, type: Array }) show!: string[];

  get flowComponents() {
    if (this.show.includes('flow-components'))
      return this.$store.state.flowComponents;
    return [];
  }

  layoutChanged(layout: Layout) {
    this.$store.commit('layout', { layout });
  }
}
</script>
<style scoped>
.surface {
  display: inline-block;
  height: 100%;
  width: 100%;
}
</style>
