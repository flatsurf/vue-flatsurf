<!--

Visualizes a Surface.

-->
<template>
  <viewer-component v-if="parsed != null" class="surface" :triangulation="parsed.triangulation" :ideal-coordinate-system="parsed.coordinateSystem">
    <template v-slot:interaction="{ relayout, svg, parsed, options }">
      <!-- TODO: Swap with buttons -->
      <path-interaction :relayout="relayout" :svg="svg" :parsed="parsed" :options="options" />
    </template>
  </viewer-component>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

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
  get parsed() {
    const triangulation = this.$store.state.triangulation; 
    if (triangulation != null) {
      return {
        triangulation,
        coordinateSystem: this.$store.state.coordinateSystem,
      }
    }
    return null;
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

