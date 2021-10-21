<template>
  <line class="segment" :x1="coords[0]" :y1="coords[1]" :x2="coords[2]" :y2="coords[3]" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Segmnt from "@/geometry/Segment";
import CoordinateSystem from "@/geometry/CoordinateSystem";

@Component
export default class Segment extends Vue {
  @Prop({ required: true, type: Object }) segment!: Segmnt;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;

  // For performance reasons we compute all coordinates at once since this
  // gets called a lot.
  get coords() {
    const embedded = this.svg.embed(this.segment);
    return [embedded.start.x, embedded.start.y, embedded.end.x, embedded.end.y];
  }
}
</script>
