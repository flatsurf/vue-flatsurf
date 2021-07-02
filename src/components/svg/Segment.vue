<template>
  <line :x1="coords[0]" :y1="coords[1]" :x2="coords[2]" :y2="coords[3]" />
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from "vue-property-decorator";

import Segmnt from "@/geometry/Segment";

@Component
export default class Segment extends Vue {
  @Prop({ required: true, type: Object }) segment!: Segmnt;

  // For performance reasons we compute all coordinates at once since this
  // gets called a lot.
  get coords() {
    const embedded = this.svg(this.segment);
    return [embedded.start.x, embedded.start.y, embedded.end.x, embedded.end.y];
  }

  @Inject()
  svg!: (s: Segmnt) => Segmnt;
}
</script>
