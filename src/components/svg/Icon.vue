<template>
  <path class="icon" :d="icon" :transform="transform" />
</template>
<script lang="ts">
import Point from "@/geometry/Point";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import Vue, { PropType } from "vue";

export default Vue.extend({
  name: "Segment",

  props: {
    point: {
      type: Object as PropType<Point>,
      required: true
    },

    icon: {
      type: String as PropType<string>,
      required: true
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
    },

    transform(): string {
      const width = 20;
      const height = 20;
      return `translate(${this.coords[0] - width / 2} ${this.coords[1] - height / 2})`;
    }
  }
});
</script>
<style lang="scss" scoped>
.icon {
  stroke: transparent !important;
  stroke-width: 0px;
  fill: black;
}
</style>
