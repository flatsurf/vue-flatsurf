<template>
  <polygon :points="points" />
</template>
<script lang="ts">
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Point from "@/geometry/Point";

import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "Ngon",

  props: {
    vertices: {
      type: Array as PropType<Point[]>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    }
  },

  computed: {
    points(): string {
      return this.vertices.map((xy) => {
        xy = this.svg.embed(xy); 
        return `${xy.x},${xy.y}`;
      }).join(",");
    }
  }
});
</script>
