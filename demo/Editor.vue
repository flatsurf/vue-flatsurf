<!--

Edit raw YAML data defining a surface.

-->
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
