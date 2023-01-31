<template>
  <!-- specify radius in any coordinate system and convert -->
  <circle class="point" :cx="coords[0]" :cy="coords[1]" :r="radius || 30" />
</template>
<script lang="ts">
import Pont from "@/geometry/Point";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "Point",

  props: {
    point: {
      type: Object as PropType<Pont>,
      required: true
    },

    radius: {
      type: Number as PropType<number | null>,
      required: true,
      default: () => ({})
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    }
  },

  computed: {
    // For performance reasons we compute all coordinates at once since this
    // gets called a lot.
    coords(): [number, number] {
      const embedded = this.svg.embed(this.point);
      return [embedded.x, embedded.y];
    }
  }
});
</script>
