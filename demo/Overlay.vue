<template>
  <v-overlay class="loading-overlay" :opacity=".2" v-if="cancellation != null && visible" :z-index="0">
    <v-container>
      <v-row>
        <v-col>
          {{ name }}…
          <v-progress-circular :indeterminate="value == null" :value="value" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn color="error" dark :disabled="cancellation.cancelled" @click="() => cancellation.cancel()">Cancel</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-overlay>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import CancellationToken from "../src/CancellationToken";
import Progress from "../src/Progress";

@Component
export default class Overlay extends Vue {
  @Prop({required: true}) cancellation!: CancellationToken | null;
  @Prop({required: true}) progress!: Progress | null;

  visible = false;

  @Watch("cancellation", {immediate: true})
  onCancellation(value: CancellationToken) {
    if (value == null)
      this.visible = false;
    else
      setTimeout(() => {
        if (this.cancellation === value)
          this.visible = true
      }, 150);
  }

  get name() {
    return this.progress!.stats.name;
  }

  get value() : number | null {
    if (this.progress!.stats.step == null || this.progress!.stats.steps == null)
      return null;
    return this.progress!.stats.step / this.progress!.stats.steps * 100;
  }
}
</script>
<style scoped>
.container {
  text-align: center;
}

.container::v-deep .v-progress-circular__overlay {
  transition: all 0.1s ease-in-out;
}
</style>
