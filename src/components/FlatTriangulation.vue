<template>
  <g>
    <ngon v-for="(face, i) of faces" :key="i" :vertices="face" />
  </g>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Triangulation from "../geometry/triangulation/FlatTriangulation";

@Component
export default class FlatTriangulation extends Vue {
  @Prop({required: true, type: Object}) surface!: Triangulation;
}
</script>
<style scoped>
</style>
