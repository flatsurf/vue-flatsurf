<!--

A demo application that lets the user load a YAML serialized surface.

-->
<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height>
        <pan-zoom v-slot="{ viewport }" class="surface" :coordinate-system="idealCoordinateSystem" :focus="focus">
          <surface-viewer :viewport="viewport" :surface="surface" @layout="onLayoutChanged" />
        </pan-zoom>
        <overlay :cancellation="overlay" :progress="progress" />
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
    </v-main>
  </v-app>
</template>
<script lang="ts">
import { Component, Provide, Vue, Watch } from "vue-property-decorator";
import PanZoom from "@/components/PanZoom.vue";
import SurfaceViewer from "@/components/SurfaceViewer.vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import FlatTriangulation from "@/geometry/triangulation/FlatTriangulation";
import FlatTriangulationLayout from "@/geometry/layout/FlatTriangulationLayout";
import square from "!!raw-loader!./hexagon.txt";
import YAML from "yaml";
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
  private readonly idealCoordinateSystem = new CoordinateSystem(true);

  raw = square;
  editor = false;
  surface = FlatTriangulation.parse(YAML.parse(this.raw), this.idealCoordinateSystem)
  error = null as string | null;
  overlay = null as CancellationToken | null;
  progress = null as Progress | null;

  focus = this.idealCoordinateSystem.box([-1, -1], [1, 1]);

  protected onLayoutChanged(layout: FlatTriangulationLayout) {
    if (!this.focus.equalTo(layout.bbox))
      this.focus = layout.bbox;
  }

  @Watch("raw")
  onRawChanged() {
    try {
      this.surface = FlatTriangulation.parse(YAML.parse(this.raw), this.idealCoordinateSystem);
      this.error = null;
    } catch(e) {
      this.error = e.message;
    }
  }

  @Provide()
  async run(callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) {
    this.overlay = new CancellationToken();
    this.progress = new Progress();
    try {
      await callback(this.overlay, this.progress);
    } finally {
      this.overlay = null;
    }
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
