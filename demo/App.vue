<!--

A demo application that lets the user play with a YAML serialized surface.

-->
<template>
  <v-app>
    <v-main>
      <overlay :cancellation="overlay" :progress="progress" />
      <v-container class="container" fluid>
        <router-view />
      </v-container>
    </v-main>
    <router-view name="menu" />
    <bottom-navigation />
  </v-app>
</template>
<script lang="ts">
import { Component, Provide, Vue } from "vue-property-decorator";

import PanZoom from "@/components/PanZoom.vue";
import Viewer from "@/components/Viewer.vue";
import CancellationToken from "@/CancellationToken";
import Progress from "@/Progress";
import Overlay from "./Overlay.vue";
import GlueInteraction from "@/components/interactions/GlueInteraction.vue";
import PathInteraction from "@/components/interactions/PathInteraction.vue";
import BottomNavigation from "./BottomNavigation.vue";

@Component({
  components: {
    BottomNavigation,
    Overlay,
    PanZoom,
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
