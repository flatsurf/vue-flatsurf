<template>
  <g>
    <rect :width="100 * scale" :height="100 * scale" />
  </g>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class FlatTriangulation extends Vue {
  // TODO: Fix type
  @Prop({required: true, type: Object}) surface!: object;
  @Prop({required: true, type: Number}) scale!: number;
}
</script>
<style scoped>
</style>
