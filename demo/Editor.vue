<!--

Edit raw YAML data defining a surface.

-->
<template>
    <!--
    <v-toolbar dark cards :color="error ? 'red' : 'green'">
      <v-btn icon dark @click="editor = false"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-card-title>Flat Triangulation Data</v-card-title>
    </v-toolbar>
    -->
    <v-card>
      <v-textarea class="editor" label="Surface Description (YAML)" :error-messages="error" v-model="raw" filled :rows="raw.split('\n').length" />
    </v-card>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Editor extends Vue {
  get error() {
    return this.$store.state.error;
  }

  get raw() {
    return this.$store.state.raw;
  }

  set raw(raw: string) {
    this.$store.dispatch("reset", {raw});
  }
}
</script>
<style scoped>
.editor {
  font-family: monospace;
}
</style>
