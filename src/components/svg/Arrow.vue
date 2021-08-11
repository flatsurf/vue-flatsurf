<template>
	<g class="arrow">
		<line :x1="x1" :y1="y1" :x2="x2" :y2="y2" />
		<path d="M 0 -3 L 12 0 L 0 3 z" :transform="atEnd" stroke-width="0"/>
	</g>
</template>
<script lang="ts">
import { Prop, Vue, Component, Inject } from "vue-property-decorator";
import Segment from "@/geometry/Segment";
import Vector from "@/geometry/Vector";
import Point from "@/geometry/Point";

@Component
export default class SVGArrow extends Vue {
	@Prop({required: true, type: Object}) segment!: Segment;

  get x1() {
    return this.svg(this.segment.start).x;
  }

  get y1() {
    return this.svg(this.segment.start).y;
  }

  get endWithoutHead() {
    return this.svg(this.segment.end).translate(this.svg(this.segment.tangentInEnd).normalize().multiply(12));
  }

  get x2() {
    return this.svg(this.endWithoutHead).x;
  }

  get y2() {
    return this.svg(this.endWithoutHead).y;
  }

	get atEnd() {
    return `translate(${this.x2} ${this.y2}) rotate(${-this.svg(this.segment).tangentInStart.angleTo(new Vector(this.svg(this.segment).parent, 1, 0))*360 / (2*Math.PI)} 0 0)`;
	}

  @Inject()
  svg!: ((xy: Point) => Point) & ((xy: Vector) => Vector) & ((xy: Segment) => Segment);
}
</script>
<style scoped>
path {
  fill: #d95f02;
}
</style>
