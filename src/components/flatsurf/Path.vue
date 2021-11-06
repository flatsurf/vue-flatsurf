<!--

  Displays a path on a surface.

-->
<!--
 | Copyright (c) 2021 Julian Rüth <julian.rueth@fsfe.org>
 |
 | Permission is hereby granted, free of charge, to any person obtaining a copy
 | of this software and associated documentation files (the "Software"), to deal
 | in the Software without restriction, including without limitation the rights
 | to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 | copies of the Software, and to permit persons to whom the Software is
 | furnished to do so, subject to the following conditions:
 |
 | The above copyright notice and this permission notice shall be included in all
 | copies or substantial portions of the Software.
 |
 | THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 | IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 | FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 | AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 | LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 | OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 | SOFTWARE.
 -->
<template>
  <g class="Path">
    <g>
      <point-component v-for="(point, i) of controlPoints" :key="i" :svg="svg" :point="point" :radius="2" />
    </g>
    <g>
      <segment-component v-for="(segment, i) of segments" :key="i" :svg="svg" :segment="segment" />
      <g v-if="animated && segments.length > 1 && segments[animation]" class="animated">
        <segment-component :svg="svg" :segment="segments[(animation + segments.length - 1) % segments.length]" />
        <segment-component :svg="svg" :segment="segments[animation]" :key="`animation-${animation}`" animated @animationend="onAnimationEnd" />
      </g>
    </g>
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import flatten from "lodash-es/flatten";

import PointComponent from "@/components/svg/Point.vue";
import SegmentComponent from "@/components/svg/Segment.vue";
import Segment from "@/geometry/Segment";
import SaddleConnection from "@/flatsurf/SaddleConnection";
import PathData from "@/flatsurf/Path";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layout from "@/layout/Layout";
import Line from "@/geometry/Line";
import Vector from "@/geometry/Vector";
import Point from "@/geometry/Point";

@Component({
  components: { PointComponent, SegmentComponent },
})
export default class PathComponent extends Vue {
  @Prop({required: true}) path!: PathData | Array<Segment | SaddleConnection>;
  @Prop({required: true}) layout!: Layout;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
  @Prop({required: false, type: Boolean, default: true }) animated!: boolean;

  get segments(): Segment[] {
    let connections = (this.path instanceof Array) ? this.path : this.path.connections;
    return flatten(connections.map((connection) => {
      if (connection instanceof Segment)
        return [connection];
      else
        return this.toSegments(connection);
    }));
  }

  get controlPoints(): Point[] {
    if (this.segments.length === 0)
      return [];

    const points = [this.segments[0].start];

    for (const segment of this.segments) {
      points.push(segment.end);
    }

    return points;
  }

  animation = 0;

  onAnimationEnd() {
    const next = (this.animation + 1) % this.segments.length;
    this.animation = next;
  }

  toSegments(connection: SaddleConnection): Segment[] {
    const segments = [];

    const vector = connection.vector;
    const crossings = [...connection.crossings];

    let start = this.layout.layout(connection.source).segment.start;
    const end = crossings.length > 0 ? this.layout.layout(connection.target).segment.start : this.layout.layout(connection.source).segment.end;

    // TODO: Use at() instead of halfEdge() to construct the point of intersection. See https://github.com/flatsurf/vue-flatsurf/issues/35.
    while(crossings.length) {
		  const crossing = crossings.shift()!;
      if (this.layout.layout(crossing.halfEdge).inner)
        continue;

      // Since we are crossing an outer half edge, we compute the intersection
      // of the saddle connection ray with it and add it to segments.
      const line = new Line(start, start.translate(vector));
      const crossingEdge = this.layout.layout(crossing.halfEdge).segment;
      const crossingLine = new Line(crossingEdge.start, crossingEdge.end);
      const intersection = line.intersect(crossingLine);
      if (intersection === null) {
        throw Error("saddle connection must intersect every crossing");
      }
      segments.push(new Segment(start, intersection));
		  
      // Now, we move the intersection point to the corresponding half-edge
      // and repeat.
      const alongHalfEdge = new Vector(intersection.parent, this.layout.layout(crossing.halfEdge).segment.start, intersection as Point);
      start = this.layout.layout(-crossing.halfEdge).segment.end.translate(alongHalfEdge);
    }

    segments.push(new Segment(start, end));
    
    return segments;
  }
}
</script>
<style lang="scss">
.Path {
  .point {
    fill: #d95f02;
  }

  .segment {
    stroke: #d95f02;
    stroke-width: 1px;
  }

  .animated .segment {
    stroke-width: 10px;
    stroke-linecap: round;
    stroke: rgba(#d95f02, .2);
  }
}
</style>
