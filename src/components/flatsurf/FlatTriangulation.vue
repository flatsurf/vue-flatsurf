<!--
  Displays a Surface with a given layout.
-->
<!--
 | Copyright (c) 2021-2023 Julian Rüth <julian.rueth@fsfe.org>
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
    sourceIndicators(): HalfEdge[] {
      return this.halfEdges.filter((a) => {
        const s = this.layout.layout(a).segment;
        const v = s.tangentInStart;

        // Do not display the indicator when there is a visible inner edge that
        // makes it clear where the half edges meet.
        if (this.edges.some((edge) => {
          if (!this.options.get(edge).visible) {
            return false;
          }

          const t = this.layout.layout(edge.positive).segment;

          if (s.start.on(t)) {
            return true;
          }

          return false;; 
        })) {
          return false;
        }

        return this.halfEdges.some((b) => {
          if (b === a) return false;

          const t = this.layout.layout(b).segment;

          if (!s.start.on(t)) return false;

          const w = t.tangentInStart;
          const angle = v.angleTo(w);
          const degree = Math.PI / 180;
          return angle < degree || angle > 359 * degree;
        });
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
