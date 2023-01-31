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
import { defineComponent } from "vue";

export default defineComponent({
  name: "Editor",

  computed: {
    error() {
      return this.$store.state.error;
    },

    raw() {
      return this.$store.state.raw;
    }
  }
});
</script>
<style scoped>
.editor {
  font-family: monospace;
}
</style>
