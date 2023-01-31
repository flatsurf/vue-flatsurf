<template>
  <g class="FlatTriangulation">
    <slot name="faces">
      <g>
        <face v-for="(face, i) of faces" :key="i" :vertices="face" :svg="svg" />
      </g>
    </slot>
    <slot />
    <slot name="edges">
      <g>
        <half-edge-component v-for="halfEdge of halfEdges" :key="halfEdge" :layout="layout" :half-edge="halfEdge" :source-indicator="sourceIndicators.includes(halfEdge)" :options="options.get(halfEdge)" :svg="svg" />
      </g>
      <g>
        <edge-component v-for="edge of edges" :key="edge.positive" :layout="layout" :edge="edge" :svg="svg" :options="options.get(edge)" />
      </g>
    </slot>
    <slot name="overlay" />
  </g>
</template>
<script lang="ts">
import Face from "./Face.vue";
import HalfEdgeComponent from "./HalfEdge.vue";
import EdgeComponent from "./Edge.vue";
import Layout from "@/layout/Layout";
import Point from "@/geometry/Point";
import HalfEdge from "@/flatsurf/HalfEdge";
import Edge from "@/flatsurf/Edge";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import IFlatTriangulationOptions from "./options/IFlatTriangulationOptions";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  components: {
    Face,
    EdgeComponent,
    HalfEdgeComponent,
  },

  name: "FlatTriangulation",

  props: {
    layout: {
      type: Object as PropType<Layout>,
      required: true
    },

    options: {
      type: Object as PropType<IFlatTriangulationOptions>,
      required: true,
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    }
  },

  computed: {
    faces(): Point[][] {
      let faces = this.layout.triangulation.faces.cycles;
      faces = faces.filter((face) => face.every((he) => this.layout.primary.includes(he)));
      return faces.map((face) => face.map((he) => this.layout.layout(he).segment.end));
    },

    halfEdges(): HalfEdge[] {
      return this.layout.triangulation.halfEdges.filter((halfEdge) => this.options.get(halfEdge).visible);
    },

    edges(): Edge[] {
      return this.layout.triangulation.edges.filter((edge) => this.options.get(edge).visible);
    },

    // Return a list of vertex indicators where half edges meet that are almost collinear.
    // TODO: Only show indicators when inner edges are not rendered, see https://github.com/flatsurf/vue-flatsurf/issues/32
    sourceIndicators(): HalfEdge[] {
      return this.halfEdges.filter((a) => {
        const s = this.layout.layout(a).segment;
        const v = s.tangentInStart;
        return this.halfEdges.some((b) => {
          if (b === a) return false;

          const t = this.layout.layout(b).segment;

          if (!s.start.on(t)) return false;

          const w = t.tangentInStart;
          const angle = v.angleTo(w);
          const degree = Math.PI / 180;
          return angle < degree || angle > 359 * degree;
        })
      });
    }
  }
});
</script>
<style lang="scss">
.FlatTriangulation:hover {
  --flat-triangulation-hover: 1;
}

.icon {
  fill-opacity: .4;
}
</style>