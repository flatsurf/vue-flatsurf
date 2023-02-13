<template>
    <v-card>
      <v-textarea class="editor" label="Surface Description (YAML)" :error-messages="message" v-model="raw" filled :rows="raw.split('\n').length" />
    </v-card>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Editor",

  computed: {
    message() {
      return this.$store.state.error || '';
    },

    raw: {
      get() {
        return this.$store.state.raw;
      },
      set(raw: string) {
        this.$store.dispatch('reset', { raw });
      },
    }
  }
});
</script>
<style scoped>
.editor {
  font-family: monospace;
}
</style>
