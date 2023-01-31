<template>
  <icon :icon="icon" :point="center" :svg="svg" />
</template>
<script lang="ts">
import Segment from "@/geometry/Segment";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import Icon from "@/components/svg/Icon.vue";
import Point from "@/geometry/Point";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  components: { Icon },
  name: "SegmentIcon",

  props: {
    segment: {
      type: Object as PropType<Segment>,
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
    center(): Point {
      return this.segment.middle;
    }
  }
});
</script>
