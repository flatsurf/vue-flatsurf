<!--
  Shows some buttons to showcase some of the features of vue-flatsurf.
-->
<!--
 | Copyright (c) 2021-2023 Julian Rüth <julian.rueth@fsfe.org>
 | 
 | Permission is hereby granted, free of charge, to any person obtaining a copy
 | of this software and associated documentation files (the "Software"), to deal
 | in the Software without restriction, including without limitation the rights
 | to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 | copies of the Software, and to permit persons to whom the Software is
 | furnished to do so, subject to the following conditions:
 | 
 | The above copyright notice and this permission notice shall be included in all
 | copies or substantial portions of the Software.
 | 
 | THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 | IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 | FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 | AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 | LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 | OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 | SOFTWARE.
 -->
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
