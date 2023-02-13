<template>
  <v-bottom-navigation :value="$route.path" @update:modelValue="onChange">
    <v-btn value="/edit">
      <span>Surface</span>
      <v-badge :model-value="error != null" color="error" icon="mdi-error" overlap>
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
    <v-btn value="/widget">
      <span>Widget</span>
      <v-icon>mdi-widgets</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BottomNavigation",

  computed: {
    error() {
      return this.$store.state.error;
    }
  },

  methods: {
    onChange(path: string) {
      this.$router.push({ path, query: this.$route.query });
    }
  }
});
</script>
