<!--

A demo application that lets the user load a YAML serialized surface.

-->
<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height>
        <overlay :cancellation="overlay" :progress="progress" />
          <surface-viewer :raw="raw" @error="onError" @ok="() => onError()" @svg="(svg) => svgExport = svg" />
      </v-container>
      <v-dialog v-model="editor" fullscreen hide-overlay transition="dialog-bottom-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" :color="error ? 'red': 'green'" dark dense small fixed bottom right fab>
            <v-icon v-if="!error">mdi-pencil</v-icon>
            <v-icon v-else>mdi-alert-circle-outline</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-toolbar dark cards :color="error ? 'red' : 'green'">
            <v-btn icon dark @click="editor = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
            <v-card-title>Flat Triangulation Data</v-card-title>
          </v-toolbar>
          <v-form class="pa-6 pt-6">
            <v-textarea class="editor" :error-messages="error" v-model="raw" auto-grow filled rows="1" />
          </v-form>
        </v-card>
      </v-dialog>
      <v-dialog v-if="!error && !overlay" v-model="svg" fullscreen hide-overlay transition="dialog-bottom-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" color="blue" dark dense small fixed bottom left fab>
            <v-icon>mdi-camera</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-toolbar dark cards color="green">
            <v-btn icon dark @click="svg = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
            <v-card-title>SVG Export</v-card-title>
          </v-toolbar>
          <v-form class="pa-6 pt-6">
            <v-textarea class="editor" v-model="svgExport" auto-grow filled rows="1" />
          </v-form>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import { Component, Provide, Vue } from "vue-property-decorator";
import PanZoom from "@/components/PanZoom.vue";
import SurfaceViewer from "@/components/SurfaceViewer.vue";
import dump from "!!raw-loader!./2-3-4-pullback-flow.txt";
import CancellationToken from "@/CancellationToken";
import Progress from "@/Progress";
import Overlay from "./Overlay.vue";

@Component({
  components: {
    Overlay,
    PanZoom,
    SurfaceViewer,
  }
})
export default class App extends Vue {
  raw = dump;
  editor = false;
  svg = false;
  svgExport = null;
  overlay = null as CancellationToken | null;
  error = null as string | null;
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

  onError(message: string | null = null) {
    this.error= message;
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
