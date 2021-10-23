<!--

Visualizes a Surface.

-->
<template>
  <viewer-component v-if="$store.state.triangulation != null" class="surface" :triangulation="$store.state.triangulation" :flow-components="flowComponents">
    <template v-slot:interaction="{ layout, relayout, svg, triangulation, options, refocus, focus }">
      <triangulation-interaction :layout="layout" :options="options" :outer="show.includes('outer')" :inner="show.includes('triangulation')" />
      <label-interaction :layout="layout" :options="options" :outer="show.includes('outer-labels')" :numeric="show.includes('numeric-labels')" />
      <path-interaction v-if="action == 'path'" :layout="layout" :svg="svg" :triangulation="triangulation" :options="options" />
      <glue-interaction v-else-if="action == 'glue'" :relayout="relayout" :svg="svg" :options="options" :focus="focus" :refocus="refocus" />
    </template>
  </viewer-component>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ViewerComponent from "@/components/Viewer.vue";
import GlueInteraction from "@/components/interactions/GlueInteraction.vue";
import PathInteraction from "@/components/interactions/PathInteraction.vue";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";

@Component({
  components: {
    ViewerComponent,
    GlueInteraction,
    PathInteraction,
    TriangulationInteraction,
    LabelInteraction,
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
}
</script>
<style scoped>
.surface {
  display: inline-block;
  height: 100%;
  width: 100%;
}
</style>

