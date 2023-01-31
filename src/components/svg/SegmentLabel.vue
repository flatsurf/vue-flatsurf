<template>
	<g :transform="transformation">
		<text><slot/></text>
	</g>
</template>
<script lang="ts">
import Segment from "@/geometry/Segment";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Vue, { PropType } from "vue";

export default Vue.extend({
    name: "HalfEdgeLabel",

    props: {
        at: {
            type: Object as PropType<Segment>,
            required: true
        },

        svg: {
            type: Object as PropType<CoordinateSystem>,
            required: true
        }
    },

    computed: {
        position(): {x: number, y: number} {
            const midpoint = this.at.middle;
            let normal = this.svg.embed(this.at.tangentInStart.rotate90CCW()).normalize();
            return this.svg.embed(midpoint).translate(normal.multiply(12));
        },

        transformation(): string {
            return `translate(${this.position.x} ${this.position.y}) translate(6 4)`;
        }
    }
});
</script>
<style lang="scss" scoped>
text {
	font-size: 75%;
  text-anchor: end;
	font-weight: 700;
  user-select: none;
}
</style>
