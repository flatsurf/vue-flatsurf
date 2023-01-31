<template>
  <line ref="line" class="segment" :class="{ animated }" :style="{'--length': length}" :x1="coords[0]" :y1="coords[1]" :x2="coords[2]" :y2="coords[3]" />
</template>
<script lang="ts">
import Segmnt from "@/geometry/Segment";

import CoordinateSystem from "@/geometry/CoordinateSystem";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  name: "Segment",

  props: {
    segment: {
      type: Object as PropType<Segmnt>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    },

    animated: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    }
  },

  computed: {
    // For performance reasons we compute all coordinates at once since this
    // gets called a lot.
    coords(): [number, number, number, number] {
      const embedded = this.svg.embed(this.segment);
      return [embedded.start.x, embedded.start.y, embedded.end.x, embedded.end.y];
    },

    length(): number {
      const embedded = this.svg.embed(this.segment);
      return embedded.length;
    },
  },

  mounted() {
    (this.$refs.line as Element).addEventListener("animationend", () => this.$emit('animationend'));
  },
});
</script>
<style lang="scss" scoped>
.animated {
  stroke-dasharray: var(--length);
  stroke-dashoffset: var(--length);
  animation: segment-dash .8s linear forwards;
}

@keyframes segment-dash {
  to {
    stroke-dashoffset: 0;
  }
}

</style>
