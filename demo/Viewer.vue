<!--

Visualizes a Surface.

-->
<template>
  <viewer-component v-if="parsed != null" class="surface" :triangulation="parsed.triangulation" :flow-components="flowComponents">
    <template v-slot:interaction="{ relayout, svg, triangulation, options }">
      <path-interaction v-if="action == 'path'" :relayout="relayout" :svg="svg" :triangulation="triangulation" :options="options" />
      <glue-interaction v-else-if="action == 'glue'" :relayout="relayout" :svg="svg" :options="options" />
    </template>
  </viewer-component>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ViewerComponent from "@/components/Viewer.vue";
import GlueInteraction from "@/components/interactions/GlueInteraction.vue";
import PathInteraction from "@/components/interactions/PathInteraction.vue";

@Component({
  components: {
    ViewerComponent,
    GlueInteraction,
    PathInteraction
  }
})
export default class Viewer extends Vue {
  @Prop({ required: false, default: "glue", type: String }) action!: string;
  @Prop({ required: false, default: () => ["boundary"], type: Array }) show!: string[];

  get parsed() {
    const triangulation = this.$store.state.triangulation; 
    if (triangulation != null) {
      return {
        triangulation,
      }
    }
    return null;
  }

  get flowComponents() {
    if (this.show.includes('flow-components'))
      return this.$store.state.flowComponents;
    return [];
  }
}
</script>
<style scoped>
.editor {
  font-family: monospace;
}

.surface {
  display: inline-block;
  height: 100%;
  width: 100%;
}

.container {
  padding: 0;
}
</style>

