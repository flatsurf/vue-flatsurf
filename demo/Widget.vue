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
  <widget-component :triangulation="triangulation" :flow-components="flowComponents" :vertical="vertical" />
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import YAML from "yaml";
import WidgetComponent from "@/components/Widget.vue";
import type { FlatTriangulationSchema } from "@/flatsurf/FlatTriangulation";
import type { FlowComponentSchema } from "@/flatsurf/FlowComponent";
import type { VerticalSchema } from "@/flatsurf/Vertical";

@Component({
  components: {
    WidgetComponent,
  },
})
export default class Widget extends Vue {
  get yaml() {
    return YAML.parse(this.$store.state.raw);
  }
  
  get triangulation() {
    const schema: FlatTriangulationSchema = {
      vertices: this.yaml.vertices,
      vectors: this.yaml.vectors,
    };
    return YAML.stringify(schema);
  }

  get flowComponents() {
    const schema: FlowComponentSchema[] = this.yaml.components || [];

    return schema.map((component) => YAML.stringify(component));
  }

  get vertical() {
    if (this.yaml.vertical == null)
      return null;

    const schema: VerticalSchema = this.yaml.vertical;

    return YAML.stringify(schema);
  }
}
</script>
