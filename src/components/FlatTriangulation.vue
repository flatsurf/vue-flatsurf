<template>
  <g>
    <ngon v-for="(face, i) of faces" :key="i" :vertices="face" />
  </g>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Triangulation from "../geometry/triangulation/FlatTriangulation";
import Ngon from "./svg/Ngon.vue";
import FlatTriangulationLayout from "../geometry/layout/FlatTriangulationLayout";

@Component({
  components: {
    Ngon,
  }
})
export default class FlatTriangulation extends Vue {
  @Prop({required: true, type: Object}) surface!: Triangulation;

  protected get faces() {
    return this.surface.faces.cycles.map((face) => face.map((he) => this.layout.layout(he).segment.end));
  }

  private get layout() {
    return new FlatTriangulationLayout(this.surface);
  }

  @Watch("layout", { immediate: true })
  layoutChanged() {
    this.$emit("layout", this.layout);
  }

}
</script>
