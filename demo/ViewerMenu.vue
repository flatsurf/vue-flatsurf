<template>
  <v-speed-dial v-model="fab" top left fixed direction="bottom">
    <template v-slot:activator>
      <v-btn :color="fab ? 'secondary' : 'primary'" v-model="fab" fab small>
        <v-icon v-if="fab">mdi-close</v-icon>
        <v-icon v-else>{{ actions[action] }}</v-icon>
      </v-btn>
    </template>
    <div v-for="[action, icon] of Object.entries(actions)" :key="action" >
      <v-btn :to="{ query: { action } }" color="primary" small fab>
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </div>
  </v-speed-dial>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ViewerMenu extends Vue {
  fab = false;

  @Prop({ required: false, default: "glue", type: String }) action!: string;

  actions = {
    'glue': 'mdi-link-variant',
    'path': 'mdi-map-marker-path',
    'view': 'mdi-eye',
  }
}
</script>
