<template>
  <g class="SaddleConnection">
      <segment-component v-for="(segment, i) of segments" :key="i" :segment="segment" />
  </g>
</template>
<script lang="ts">
import FlatTriangulationLayout from '@/geometry/layout/FlatTriangulationLayout';
import  { Vue, Component, Prop } from "vue-property-decorator";
import SaddleConnectionData from "../geometry/triangulation/SaddleConnection";
import SegmentComponent from "./svg/Segment.vue";
import Segment from "../geometry/Segment";
import Point from "../geometry/Point";
import Line from "../geometry/Line";
import Vector from "../geometry/Vector";

@Component({
  components: {
    SegmentComponent,
  }
})
export default class FlowComponent extends Vue {
  @Prop({ required: true }) connection!: SaddleConnectionData;
  @Prop({ required: true }) layout!: FlatTriangulationLayout;

  get segments(): Segment[] {
    const segments = [];

    const vector = this.connection.vector;
    const crossings = [...this.connection.crossings];

    let start = this.layout.layout(this.connection.source).segment.start;
    const end = crossings.length > 0 ? this.layout.layout(this.connection.target).segment.start : this.layout.layout(this.connection.source).segment.end;

    // TODO: Use at() instead of halfEdge() to construct the point of intersection.
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
