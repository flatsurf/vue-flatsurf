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
  <layouter :triangulation="parsedTriangulation" v-slot="{ layout }">
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
            <v-checkbox v-model="showFlowComponents" label="Show Flow Components" :disabled="flowComponents.length == 0" hide-details />
            <v-checkbox v-model="applyVertical" label="Rotate to Vertical" :disabled="vertical == null" hide-details />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-title>
            Widget Interaction
          </v-card-title>
          <v-card-text>
            TEXT
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="col-md-4 col-12">
        <v-card>
          <v-card-title>
            Widget Output
          </v-card-title>
          <v-card-text>
            <viewer class="surface" :triangulation="parsedTriangulation" :flow-components="parsedFlowComponents" :layout="layout" :vertical="parsedVertical">
              <template v-slot:interaction="{ options }">
                <triangulation-interaction :layout="layout" :options="options" :outer="showOuterHalfEdges" :inner="showInnerEdges" />
                <label-interaction :layout="layout" :options="options" :outer="showOuterLabels" :numeric="showNumericLabels" />
              </template>
            </viewer>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </layouter>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import YAML from "yaml";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import FlowComponent from "@/flatsurf/FlowComponent";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layouter from "@/components/Layouter";
import Viewer from "@/components/Viewer.vue";
import TriangulationInteraction from "@/components/interactions/TriangulationInteraction";
import LabelInteraction from "@/components/interactions/LabelInteraction";
import Vertical from "@/flatsurf/Vertical";

@Component({
  components: {
    Layouter,
    Viewer,
    TriangulationInteraction,
    LabelInteraction,
  },
})
export default class Widget extends Vue {
  @Prop({ required: true, type: String }) triangulation!: string;
  @Prop({ required: false, default: () => [], type: Array }) flowComponents!: string[];
  @Prop({ required: false, default: null, type: String }) vertical!: string | null;

  coordinateSystem = new CoordinateSystem(true);

  showInnerEdges = true;
  showOuterHalfEdges = true;

  showOuterLabels = true;
  showNumericLabels = false;

  showFlowComponents = false;

  applyVertical = true;

  get parsedTriangulation(): FlatTriangulation {
    return FlatTriangulation.parse(YAML.parse(this.triangulation), this.coordinateSystem);
  }

  get parsedFlowComponents(): FlowComponent[] {
    if (!this.showFlowComponents)
      return [];

    return this.flowComponents.map((component) => FlowComponent.parse(YAML.parse(component), this.coordinateSystem)); 
  }

  get parsedVertical() {
    if (!this.applyVertical)
      return null;

    if (this.vertical == null)
      return null;

    return Vertical.parse(YAML.parse(this.vertical), this.coordinateSystem);
  }
}
</script>
