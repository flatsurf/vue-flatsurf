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
