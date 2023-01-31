<template>
  <ngon :vertices="vertices" :svg="svg" />
</template>
<script lang="ts">
import Point from "@/geometry/Point";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import Ngon from "@/components/svg/Ngon.vue";
import Vue, { PropType } from "vue";

export default Vue.extend({
  components: { Ngon },
  name: "Face",

  props: {
    vertices: {
      type: Array as PropType<Point[]>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    }
  }
});
</script>
<style lang="scss" scoped>
polygon {
	stroke: transparent;
	stroke-width: 0px;
	fill: rgba(lightcyan, .5);
}
</style>