<!--

Displays a surface from flatsurf and related objects such as flow components.

-->
<template>
  <pan-zoom v-slot="{ viewport }" :coordinate-system="idealCoordinateSystem" v-model="focus">
    <flatsurf v-if="layout != null" :width="viewport.width" :height="viewport.height" @dblclick="focus = layout.hull" :triangulation="triangulation" :layout="layout" :viewport-coordinate-system="viewport.viewportCoordinateSystem" :visualization-options="visualizationOptions" :flow-components="flowComponents">
      <slot name="interaction" v-bind:layout="layout" v-bind:relayout="relayout" v-bind:svg="viewport.viewportCoordinateSystem" v-bind:triangulation="triangulation" v-bind:options="visualizationOptions" />
    </flatsurf>
  </pan-zoom>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from "vue-property-decorator";

import Layout from "@/layout/Layout";
import Polygon from "@/geometry/Polygon";
import FlowComponent from "@/flatsurf/FlowComponent"
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import Automorphism from "@/flatsurf/Automorphism";
import LayoutOptions from "@/layout/LayoutOptions";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";

import Progress from "@/Progress";
import CancellationToken, { OperationAborted } from "@/CancellationToken";

import PanZoom from "./PanZoom.vue";
import Flatsurf from "./flatsurf/Flatsurf.vue";

@Component({
  components: {
    PanZoom,
    Flatsurf,
  }
})
export default class Viewer extends Vue {
  @Prop({ required: true, type: Object }) triangulation!: FlatTriangulation;
  @Prop({ required: false, type: Array, default: () => [] }) automorphisms!: Automorphism[];
  @Prop({ required: false, default: () => [], type: Array }) flowComponents!: FlowComponent[];

  protected visualizationOptions = new VisualizationOptions();

  protected layout = null as Layout | null;

  private pendingRelayout = new CancellationToken();

  private focus: Polygon | null = null;

  get idealCoordinateSystem() {
    return this.triangulation.coordinateSystem;
  }

  static async _run(callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) {
    await callback(new CancellationToken(), new Progress());
  }

  @Inject({ from: 'run', default: Viewer._run})
  run!: (callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) => Promise<void>;

  /*
  private defaultLabel = {} as Record<HalfEdge, string | null>;
  private nextLabel(label: string) {
    let chars = label.split('').map((c) => c.charCodeAt(0) - 65);
    chars[chars.length - 1]++;
    for (let i = chars.length; i--;) {
      if (chars[i] == 25) {
        chars[i] = 0;
        if (i == 0)
          chars = [0, ...chars];
        else
          chars[i - 1]++;
      }
    }

    return chars.map((code) => String.fromCharCode(65 + code)).join('');
  }
  */

  async relayout(layoutOptions?: LayoutOptions): Promise<Layout | null> {
    if (layoutOptions === undefined) {
      if (this.layout != null)
        return this.layout;
      layoutOptions = new LayoutOptions(() => null, this.automorphisms);
    }

    this.pendingRelayout.abort();
    await this.run(async (cancellation, progress) => {
      this.pendingRelayout = cancellation;
      try {
        // TODO: Relayout in a way that keeps the previous picture intact, e.g., by leaving the selected half edge in the same place.
        this.layout = await Layout.layout(this.triangulation, layoutOptions!, cancellation, progress);
      } catch (e) {
        if (e instanceof OperationAborted) return;
        throw e;
      }
      
      // Only display components whose half edges and faces have been rendered.
      /* TODO
      this.components = this.parsed.components.filter((component) =>
        !component.perimeter.some((connection: FlowConnection) =>
          ! this.layout!.primary.includes(connection.connection.source) && !this.layout!.primary.includes(connection.connection.target)
        )
      );
      */
      
      // Recompute labels
      /* TODO
      let nextLabel = "A";
      const componentInnerHalfEdges = [...this.components.filter((component) => component.cylinder).map((component) => component.inside)];
      const cylinderInnerHalfEdges = componentInnerHalfEdges.map((halfEdges) => halfEdges.filter((halfEdge) => halfEdges.includes(-halfEdge))).flat();

      // TODO: Move to SurfaceViewer
      this.defaultLabel = {};
      for (const halfEdge of this.parsed.surface.halfEdges) {
        if (this.defaultLabel[halfEdge] !== undefined)
          continue;

        if (!this.layout!.layout(halfEdge).primary)
          continue

        // Do not show labels for half edges in the interior of cylinders.
        if (cylinderInnerHalfEdges.includes(halfEdge)) {
          this.defaultLabel[halfEdge] = null;
          continue;
        }

        if (this.layout!.layout(halfEdge).inner) {
          this.defaultLabel[halfEdge] = null;
          continue;
        }
        
        for (const orbit of Automorphism.orbit(halfEdge, this.parsed.automorphisms)) {
          this.defaultLabel[orbit] = nextLabel;
          this.defaultLabel[-orbit] = nextLabel;
        }

        nextLabel = this.nextLabel(nextLabel);
      }
      */

      /* TODO
      this.$nextTick(() => {
        // TODO: Maybe we should not always export the SVG but only do so on demand.
        const exporter = new SVGExporter(this.$refs.svg as HTMLElement);
        exporter.simplifyColors();
        exporter.dropNonStandardStyles();
        exporter.dropNonInkscapeStyles();
        exporter.dropTrivialStyles();
        exporter.dropRedundantStyles();
        exporter.dropClasses();
        exporter.dropPrefixedStyles();
        exporter.dropInvisible();
        exporter.dropInteractiveStyles();
        exporter.dropCustomAttributes();
        exporter.usePresentationAttributes();
        exporter.inlineStyles();
        this.$emit('svg', exporter.toString());
      });
      */

      // We refocus on the entire surface if the convex hull has changed.
      if (this.focus == null || !this.focus.equalTo(this.layout.hull))
        this.focus = this.layout.hull;
    });

    return this.layout;
  }

  /* TODO: Find another way to expose this.
  @Watch("inner", {immediate: true})
  onInnerChanged() {
    this.forced = this.inner;
  }
  */

  @Watch("triangulation", { immediate: true })
  onSurfaceChanged() {
    this.layout = null;
    this.relayout();
    this.visualizationOptions = new VisualizationOptions();
  }
}
</script>
