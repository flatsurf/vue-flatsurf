<template>
  <v-bottom-navigation color="primary" :value="$route.path" @change="(path) => $router.push({ path, query: $route.query })" fixed app>
    <v-btn value="/edit">
      <span>Surface</span>
      <v-badge :value="error != null" color="error" icon="mdi-error" overlap>
      <v-icon>mdi-layers</v-icon>
      </v-badge>
    </v-btn>
    <v-btn value="/view">
      <span>Visualization</span>
      <v-icon>mdi-eye</v-icon>
    </v-btn>
    <v-btn value="/svg">
      <span>SVG</span>
      <v-icon>mdi-svg</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class BottomNavigation extends Vue {
  get error() {
    return this.$store.state.error;
  }
}
</script>
