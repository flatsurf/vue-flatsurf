<!--

A demo application that lets the user play with a YAML serialized surface.

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
  <v-app>
    <v-main>
      <v-container class="container" fluid>
        <router-view />
      </v-container>
      <overlay :cancellation="overlay" :progress="progress" />
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
