<!--

A demo application that lets the user load a YAML serialized surface.

-->
<template>
  <v-app>
    <v-main>
      <overlay :cancellation="overlay" :progress="progress" />
      <v-container class="container" fluid>
        <keep-alive>
          <router-view :key="$route.path"/>
        </keep-alive>
      </v-container>
    </v-main>
    <v-bottom-navigation color="primary" :value="$route.path" @change="(path) => $router.push(path)" fixed app>
      <v-btn value="/editor">
        <span>Surface</span>
        <v-badge :value="error != null" color="error" icon="mdi-error" overlap>
        <v-icon>mdi-layers</v-icon>
        </v-badge>
      </v-btn>
      <v-btn value="/viewer">
        <span>Visualization</span>
        <v-icon>mdi-eye</v-icon>
      </v-btn>
      <v-btn value="/svg">
        <span>SVG</span>
        <v-icon>mdi-svg</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <router-view name="menu" />
  </v-app>
</template>
<script lang="ts">
import { Component, Provide, Vue } from "vue-property-decorator";

import PanZoom from "@/components/PanZoom.vue";
import Parser from "@/components/Parser.vue";
import Viewer from "@/components/Viewer.vue";
import CancellationToken from "@/CancellationToken";
import Progress from "@/Progress";
import Overlay from "./Overlay.vue";
import GlueInteraction from "@/components/interactions/GlueInteraction.vue";
import PathInteraction from "@/components/interactions/PathInteraction.vue";

@Component({
  components: {
    Overlay,
    PanZoom,
    Parser,
    Viewer,
    GlueInteraction,
    PathInteraction
  }
})
export default class App extends Vue {
  overlay = null as CancellationToken | null;
  progress = null as Progress | null;

  @Provide()
  async run(callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) {
    // Any previous run is supposedly cancelled already so we can safely throw
    // away its cancellation and progress tokens.
    const cancellation = new CancellationToken();
    this.overlay = cancellation;
    this.progress = new Progress();
    try {
      await callback(this.overlay, this.progress);
    } finally {
      if (this.overlay === cancellation)
        // We came here because this process completed. Remove the overlay.
        this.overlay = null;
    }
  }

  get error() {
    return this.$store.state.error;
  }
}
</script>
<style scoped>
.container {
  height: 100%;
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
