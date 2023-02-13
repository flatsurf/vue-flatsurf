<template>
  <v-app>
    <v-main>
      <v-container class="container" fluid>
        <router-view />
      </v-container>
      <overlay-component :cancellation="overlay" :progress="progress" />
    </v-main>
    <router-view name="menu" />
    <bottom-navigation />
  </v-app>
</template>
<script lang="ts">
import PanZoom from "@/components/PanZoom.vue";

import Viewer from "@/components/Viewer.vue";
import CancellationToken from "@/CancellationToken";
import Progress from "@/Progress";
import OverlayComponent from "./Overlay.vue";
import GlueInteraction from "@/components/interactions/GlueInteraction.vue";
import PathInteraction from "@/components/interactions/PathInteraction.vue";
import BottomNavigation from "./BottomNavigation.vue";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  components: {
    BottomNavigation,
    OverlayComponent,
    PanZoom,
    Viewer,
    GlueInteraction,
    PathInteraction
  },

  name: "App",

  data(){
    return {
      overlay: null as CancellationToken | null,
      progress: null as Progress | null
    };
  },

  props: {
    surface: {
      type: String as PropType<string>,
    }
  },

  watch: {
    surface: {
      immediate: true,
      handler(raw) {
        this.$store.dispatch("reset", { raw });
      }
    },
  },

  provide: {
    async run(
      callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>
    ) {
      // Any previous run is supposedly cancelled already so we can safely throw
      // away its cancellation and progress tokens.
      const cancellation = new CancellationToken();
      this.overlay = cancellation;
      this.progress = new Progress();
      try {
        await callback(this.overlay as CancellationToken, this.progress as Progress);
      } finally {
        if (this.overlay === cancellation)
          // We came here because this process completed. Remove the overlay.
          this.overlay = null;
      }
    }
  }
});
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
