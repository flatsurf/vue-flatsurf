<template>
	<g :transform="transformation">
		<text><slot/></text>
	</g>
</template>
<script lang="ts">
import { Vue, Component, Inject, Prop } from "vue-property-decorator";
import Segment from "@/geometry/Segment";
import Vector from "@/geometry/Vector";
import Point from "@/geometry/Point";

@Component
export default class HalfEdgeLabel extends Vue {
	@Prop({required: true, type: Object}) at!: Segment;

	get position() {
		const midpoint = this.at.middle;
		let normal = this.svg(this.at.tangentInStart.rotate90CCW()).normalize();
		return this.svg(midpoint).translate(normal.multiply(12));
	}

	get transformation() {
		return `translate(${this.position.x} ${this.position.y}) translate(6 4)`;
	}

  @Inject()
  svg!: ((xy: Point) => Point) & ((xy: Vector) => Vector);
}
</script>
<style lang="scss" scoped>
text {
	font-size: 75%;
  text-anchor: end;
	font-weight: 700;
}
</style>
