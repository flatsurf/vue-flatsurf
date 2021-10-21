<template>
  <polygon :points="points" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import CoordinateSystem from "@/geometry/CoordinateSystem";

import Point from "@/geometry/Point";

@Component
export default class Ngon extends Vue {
  @Prop({ required: true, type: Array }) vertices!: Point[];
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;

  get points() {
    return this.vertices.map((xy) => {
      xy = this.svg.embed(xy); 
      return `${xy.x},${xy.y}`;
    }).join(",");
  }
}
</script>
