<!--
 | Copyright (c) 2021 Julian Rüth <julian.rueth@fsfe.org>
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
  <div>
    <v-speed-dial v-model="showActions" top left fixed direction="bottom">
      <template v-slot:activator>
        <v-btn :color="showActions ? 'secondary' : 'primary'" fab small>
          <v-icon v-if="showActions">mdi-close</v-icon>
          <v-icon v-else>{{ actions[action] }}</v-icon>
        </v-btn>
      </template>
      <div v-for="[action, icon] of Object.entries(actions)" :key="action" >
        <v-btn @click="goto(action)" color="primary" small fab>
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

  @Prop({ required: true, type: String }) action!: string;
  @Prop({ required: true, type: Array }) show!: string[];

  actions = {
    'glue': 'mdi-link-variant',
    'path': 'mdi-map-marker-path',
    'view': 'mdi-hand-back-right-outline',
  }

  parts = {
    'outer': 'mdi-border-all-variant',
    'triangulation': 'mdi-triforce',
    'flow-components': 'mdi-waves-arrow-up',
    'numeric-labels': 'mdi-numeric',
    'outer-labels': 'mdi-alphabetical',
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
