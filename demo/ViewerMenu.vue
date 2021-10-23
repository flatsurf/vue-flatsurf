<template>
  <div>
    <v-speed-dial v-model="showActions" top left fixed direction="bottom">
      <template v-slot:activator>
        <v-btn :color="showActions ? 'secondary' : 'orange'" fab small>
          <v-icon v-if="showActions">mdi-close</v-icon>
          <v-icon v-else>{{ actions[action] }}</v-icon>
        </v-btn>
      </template>
      <div v-for="[action, icon] of Object.entries(actions)" :key="action" >
        <v-btn @click="goto(action)" color="orange" small fab>
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </div>
    </v-speed-dial>
    <v-speed-dial v-model="showParts" top right fixed direction="bottom">
      <template v-slot:activator>
        <v-btn :color="showParts ? 'secondary' : 'primary'" fab small>
          <v-icon v-if="showParts">mdi-close</v-icon>
          <v-icon v-else>mdi-eye</v-icon>
        </v-btn>
      </template>
      <div v-for="[part, icon] of Object.entries(parts)" :key="part" >
        <v-btn @click="goto(undefined, part)" :color="show.includes(part) ? 'primary' : 'secondary'" small fab>
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </div>
    </v-speed-dial>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ViewerMenu extends Vue {
  showActions = false;
  showParts = false;

  @Prop({ required: false, default: "glue", type: String }) action!: string;
  @Prop({ required: false, default: () => ["boundary"], type: Array }) show!: string[];

  actions = {
    'glue': 'mdi-link-variant',
    'path': 'mdi-map-marker-path',
    'view': 'mdi-hand-back-right-outline',
  }

  parts = {
    'boundary': 'mdi-border-all-variant',
    'triangulation': 'mdi-triforce',
    'flow-components': 'mdi-waves-arrow-up',
  }

  goto(action?: string, part?: string) {
    let show = [...this.show];
    if (part != null) {
      if (show.includes(part))
        show = show.filter((p) => p != part);
      else
        show.push(part);
    }
      
    this.$router.replace({
      path: this.$route.path,
      query: {
        ...this.$route.query,
        action: action || this.action,
        show
      }})
  }
}
</script>
