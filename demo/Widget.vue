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
    <v-row>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-title>
            vue-flatsurf Widget
          </v-card-title>
          <v-card-text>
            <p>The <code>Widget</code> component encapsulated all the features of vue-flatsurf in a single component to simplify interacting with the widget from Jupyter Notebooks, e.g., through <a href="https://github.com/flatsurf/ipyvue-flatsurf">ipyvue-flatsurf</a>.</p>
            <p>This view exposes all the features of that widget but is not connected to the other views of this demo application.</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-title>
            Widget Visualization
          </v-card-title>
          <v-card-text>
            <v-checkbox v-model="showInnerEdges" label="Show Inner Edges" hide-details />
            <v-checkbox v-model="showOuterHalfEdges" label="Show Outer Half Edges" hide-details />
            <v-checkbox v-model="showNumericLabels" label="Show Numeric Labels on Edges and Half Edges" hide-details />
            <v-checkbox v-model="showOuterLabels" label="Show Alphanumeric Labels on Outer Half Edges" hide-details />
            <v-checkbox v-model="showFlowComponents" label="Show Flow Components" :disabled="yaml.components.length == 0" hide-details />
            <v-checkbox v-model="applyVertical" label="Rotate to Vertical" :disabled="yaml.vertical == null" hide-details />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-title>
            Widget Output
          </v-card-title>
          <v-card-text>
            <widget-component ref="widget" :triangulation="triangulation" :flow-components="flowComponents" :vertical="vertical" :showInnerEdges="showInnerEdges" :showOuterHalfEdges="showOuterHalfEdges" :showOuterLabels="showOuterLabels" :showNumericLabels="showNumericLabels" :action="action" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-title>
            Widget Interaction
          </v-card-title>
          <v-card-text>
            <v-select :items="actions" v-model="action" item-text="text" item-value="value"/>
            <v-container v-if="action === null">
              Drag &amp; Zoom the Surface.
            </v-container>
            <v-container v-if="action === 'glue'">
              <p>
                Left-click on a half edge to force it to be visually
                glued. Click again to choose gluing automatically for this half
                edge.
              </p>
              <p>
                Right-click on a half edge to force it to be visually unglued.
                Click again to choose gluing automatically for this half edge.
              </p>
            </v-container>
            <v-container v-if="action === 'path'">
              Click any vertex to start a path. Click half edges or vertices to draw the path. Press the escape key when the path is complete.
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-title>
            Query Widget
          </v-card-title>
          <v-card-text>
            <v-select :items="queries" :disabled="info === '…'" v-model="query"/>
            <p v-if="query === 'SVG'">
              Return the widget as a standalone SVG.
            </p>
            <p v-else-if="query === 'Path'">
              Return the currently drawn path if any path is being drawn.
            </p>
            <p v-else-if="query === 'Complete Path'">
              Return the path once its complete, i.e., once the user pressed Escape.
            </p>
            <p v-else-if="query === 'Path Change'">
              Return the path once it changes.
            </p>
            <p class="tiny" v-text="info" />
            <v-container class="text-right"><v-btn :loading="info === '…'" @click="performQuery">Refresh</v-btn></v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Ref, Vue, Watch } from "vue-property-decorator";

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
  showInnerEdges = true;
  showOuterHalfEdges = true;

  showOuterLabels = true;
  showNumericLabels = false;

  showFlowComponents = false;

  applyVertical = true;

  actions = [
    {text: "None", value: null},
    {text: "Change Layout", value: "glue"},
    {text: "Draw Path", value: "path"},
  ]

  action = "glue";

  info = "(none)";

  queries = ["SVG", "Path", "Complete Path", "Path Change"];

  query = 'Path'

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
    if (!this.showFlowComponents)
      return [];

    const schema: FlowComponentSchema[] = this.yaml.components || [];

    return schema.map((component) => YAML.stringify(component));
  }

  get vertical() {
    if (this.yaml.vertical == null)
      return null;

    if (!this.applyVertical)
      return null;

    const schema: VerticalSchema = this.yaml.vertical;

    return YAML.stringify(schema);
  }

  @Watch("query", {immediate: true})
  onQueryChanged() {
    this.info = "(none)";
  }

  async performQuery() {
    this.info = "…";

    const query = (() => {
      if (this.query === "SVG")
        return this.widget.svg();
      if (this.query === 'Path')
        return this.widget.path("now");
      if (this.query === 'Complete Path')
        return this.widget.path("completed");
      if (this.query === 'Path Change')
        return this.widget.path("changed");
    })();

    try {
      this.info = JSON.stringify(await query);
    } catch(e) { 
      this.info = e.message;
    }
  }

  @Ref()
  readonly widget!: WidgetComponent;
}
</script>
<style scoped>
.tiny {
  font-family: monospace;
  font-size: 6pt;
  line-height: 1.4;
}
</style>
