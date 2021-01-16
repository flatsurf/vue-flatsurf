<template>
  <line :x1="x1" :y1="y1" :x2="x2" :y2="y2" />
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from "vue-property-decorator";

import Segmnt from "@/geometry/Segment";
import Point from "@/geometry/Point";

@Component
export default class Segment extends Vue {
  @Prop({ required: true, type: Object }) segment!: Segmnt;

  get x1() {
    return this.svg(this.segment.start).x;
  }

  get y1() {
    return this.svg(this.segment.start).y;
  }

  get x2() {
    return this.svg(this.segment.end).x;
  }

  get y2() {
    return this.svg(this.segment.end).y;
  }

  @Inject()
  svg!: (xy: Point) => Point;
}
</script>
