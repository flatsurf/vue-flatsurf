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
      </v-container>
      <v-dialog v-model="editor" fullscreen hide-overlay transition="dialog-bottom-transition">
        <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" color="green" dark dense small fixed bottom right fab>
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        </template>
        <v-card>
          <v-toolbar dark cards color="green">
            <v-btn icon dark @click="editor = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
            <v-card-title>Flat Triangulation Data</v-card-title>
          </v-toolbar>
          <v-form class="pa-6 pt-6">
            <v-textarea class="editor" v-model="raw" auto-grow filled rows="1" />
            <v-alert v-if="error" type="error">{{ this.error }}</v-alert>
          </v-form>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import PanZoom from "@/components/PanZoom.vue";
import SurfaceViewer from "@/components/SurfaceViewer.vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import FlatTriangulation from "@/geometry/triangulation/FlatTriangulation";
import FlatTriangulationLayout from "@/geometry/layout/FlatTriangulationLayout";
import square from "!!raw-loader!./hexagon.txt";
import YAML from "yaml";

@Component({
  components: {
    PanZoom,
    SurfaceViewer,
  }
})
export default class App extends Vue {
  raw = square;
  editor = false;
  surface = FlatTriangulation.parse(YAML.parse(this.raw))
  error = null as string | null;

  private readonly idealCoordinateSystem = new CoordinateSystem(true);

  focus = this.idealCoordinateSystem.box([-1, -1], [1, 1]);

  protected onLayoutChanged(layout: FlatTriangulationLayout) {
    this.focus = layout.bbox;
  }

  @Watch("raw")
  onRawChanged() {
    try {
      this.surface = FlatTriangulation.parse(YAML.parse(this.raw));
      this.error = null;
    } catch(e) {
      this.error = e.message;
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
