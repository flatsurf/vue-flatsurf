<template>
  <ngon :vertices="vertices" :svg="svg" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Point from "@/geometry/Point";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Ngon from "@/components/svg/Ngon.vue";

@Component({
  components: { Ngon }
})
export default class Face extends Vue {
  @Prop({ required: true, type: Array }) vertices!: Point[];
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
}
</script>
<style lang="scss" scoped>
polygon {
	stroke: transparent;
	stroke-width: 0px;
	fill: rgba(lightcyan, .5);
}
</style>
