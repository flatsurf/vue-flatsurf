<template>
  <polygon :points="points" />
</template>
<script lang="ts">
import { Component, Prop, } from "vue-property-decorator";

import Point from "@/geometry/Point";

import SVG from "./SVG";

@Component
export default class Ngon extends SVG {
  @Prop({ required: true, type: Array }) vertices!: Point[];

  get points() {
    return this.vertices.map((xy) => {
      xy = this.svg(xy); 
      return `${xy.x},${xy.y}`;
    }).join(",");
  }
}
</script>
<style lang="scss" scoped>
polygon {
	stroke: #d1d1d1;
	stroke-width: 1px;
	fill: rgba(lightcyan, .5);
}
</style>
