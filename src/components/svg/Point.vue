<template>
  <!-- specify radius in any coordinate system and convert -->
  <circle class="point" :cx="coords[0]" :cy="coords[1]" :r="radius || 30" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Pont from "@/geometry/Point";
import CoordinateSystem from "@/geometry/CoordinateSystem";

@Component
export default class Point extends Vue {
  @Prop({ required: true, type: Object }) point!: Pont;
  @Prop({required: false, type: Number, default: null}) radius!: number | null;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;

  // For performance reasons we compute all coordinates at once since this
  // gets called a lot.
  get coords() {
    const embedded = this.svg.embed(this.point);
    return [embedded.x, embedded.y];
  }
}
</script>
