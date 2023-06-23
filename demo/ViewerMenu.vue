<template>
  <div class="menu">
    <v-container>
      <v-row v-for="[action, icon] of Object.entries(actions)" :key="action" >
        <div class="ma-1">
          <v-btn @click="goto(action)" :icon="icon" color="primary" size="small" elevation="8"/>
        </div>
      </v-row>
    </v-container>
  </div>
  <div class="menu">
    <v-container>
      <v-row v-for="[part, icon] of Object.entries(parts)" :key="part" justify="end">
        <div class="ma-1">
          <v-btn @click="goto(undefined, part)" :color="show.includes(part) ? 'primary' : 'secondary'" small fab elevation="8" :icon="icon" size="small"/>
        </div>
      </v-row>
    </v-container>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "ViewerMenu",

  props: {
    action: {
      type: String as PropType<"glue" | "path" | "view">,
      required: true
    },

    show: {
      type: Array as PropType<string[]>,
      required: true
    }
  },

  data() {
    return {
      showActions: true,
      showParts: false,

      actions: {
        'glue': 'mdi-link-variant',
        'path': 'mdi-map-marker-path',
        'view': 'mdi-hand-back-right-outline',
      },

      parts: {
        'outer': 'mdi-border-all-variant',
        'triangulation': 'mdi-triforce',
        'flow-components': 'mdi-waves-arrow-up',
        'numeric-labels': 'mdi-numeric',
        'outer-labels': 'mdi-alphabetical',
      }
    };
  },

  methods: {
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
});
</script>
<style scoped>
.menu {
  position: absolute;
  top: 0px;
  padding: 1ex;
}

.menu ~ .menu {
  right: 0px;
}
</style>
