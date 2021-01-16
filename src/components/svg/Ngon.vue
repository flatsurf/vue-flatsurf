<template>
  <polygon :points="points" />
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from "vue-property-decorator";

import Point from "@/geometry/Point";

@Component
export default class Ngon extends Vue {
  @Prop({ required: true, type: Array }) vertices!: Point[];

  get points() {
    return this.vertices.map((xy) => {
      xy = this.svg(xy); 
      return `${xy.x},${xy.y}`;
    }).join(",");
  }

  @Inject()
  svg!: (xy: Point) => Point;
}
</script>
