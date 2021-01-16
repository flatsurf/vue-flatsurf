<template>
  <ngon :vertices="vertices" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Point from "@/geometry/Point";
import Ngon from "./svg/Ngon.vue";

@Component({
  components: { Ngon }
})
export default class Face extends Vue {
  @Prop({ required: true, type: Array }) vertices!: Point[];
}
</script>
<style lang="scss" scoped>
polygon {
	stroke: transparent;
	stroke-width: 0px;
	fill: rgba(lightcyan, .5);
}
</style>
