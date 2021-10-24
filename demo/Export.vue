<template>
  <layouter v-if="$store.state.triangulation != null" :triangulation="$store.state.triangulation" :layout="$store.state.layout" v-slot="{ layout }">
    <viewer-component class="surface" :triangulation="$store.state.triangulation" :flow-components="flowComponents" :layout="$store.state.layout || layout">
      <template v-slot:interaction="{ options }">
        <g v-if="layout != null">
          <triangulation-interaction :layout="layout" :options="options" :outer="show.includes('outer')" :inner="show.includes('triangulation')" />
          <label-interaction :layout="layout" :options="options" :outer="show.includes('outer-labels')" :numeric="show.includes('numeric-labels')" />
        </g>
      </template>
    </viewer-component>
  </layouter>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ViewerComponent from "@/components/Viewer.vue";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";
import Layouter from "@/components/Layouter";
import Layout from "@/layout/Layout";

@Component({
  components: {
    ViewerComponent,
    TriangulationInteraction,
    LabelInteraction,
    Layouter,
  }
})
export default class Export extends Vue {
  @Prop({ required: true, type: Array }) show!: string[];

  layout: Layout | null = null;

  get flowComponents() {
    if (this.show.includes('flow-components'))
      return this.$store.state.flowComponents;
    return [];
  }

}
</script>
