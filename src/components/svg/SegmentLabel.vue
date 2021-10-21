<template>
	<g :transform="transformation">
		<text><slot/></text>
	</g>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Segment from "@/geometry/Segment";
import CoordinateSystem from "@/geometry/CoordinateSystem";

@Component
export default class HalfEdgeLabel extends Vue {
	@Prop({required: true, type: Object}) at!: Segment;
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;

	get position() {
		const midpoint = this.at.middle;
		let normal = this.svg.embed(this.at.tangentInStart.rotate90CCW()).normalize();
		return this.svg.embed(midpoint).translate(normal.multiply(12));
	}

	get transformation() {
		return `translate(${this.position.x} ${this.position.y}) translate(6 4)`;
	}
}
</script>
<style lang="scss" scoped>
text {
	font-size: 75%;
  text-anchor: end;
	font-weight: 700;
}
</style>
