<template>
  <v-navigation-drawer permanent app>
    <v-list nav dense>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            PREDEFINED SURFACES
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item-group color="primary" v-model="selected">
        <v-list-item v-for="name of Object.keys(predefined)" :key="name" :value="name" :disabled="selected == name">
          <v-list-item-content>
            <v-list-item-title v-text="name"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>
<script lang="ts">
import Torus from "!!raw-loader!./torus.txt"
import Triangle_1_1_1 from "!!raw-loader!./1-1-1.txt"
import Triangle_1_1_3 from "!!raw-loader!./1-1-3.txt"
import Triangle_1_1_3_Without_Marked_Point from "!!raw-loader!./1-1-3-without-marked-point.txt";
import Triangle_1_2_2 from "!!raw-loader!./1-2-2.txt"
import Triangle_1_2_2_Without_Marked_Point from "!!raw-loader!./1-2-2-without-marked-point.txt";
import Triangle_1_2_5 from "!!raw-loader!./1-2-5.txt"
import Triangle_2_3_4 from "!!raw-loader!./2-3-4.txt"

import { Component, Vue } from "vue-property-decorator";

@Component
export default class EditorMenu extends Vue {
  predefined = {
    "Torus": Torus,
    "Triangle (1, 1, 1)": Triangle_1_1_1,
    "Triangle (1, 1, 3) with Marked Points": Triangle_1_1_3,
    "Triangle (1, 1, 3) w/o Marked Points": Triangle_1_1_3_Without_Marked_Point,
    "Triangle (1, 2, 2) with Marked Points": Triangle_1_2_2,
    "Triangle (1, 2, 2) w/o Marked Points": Triangle_1_2_2_Without_Marked_Point,
    "Triangle (1, 2, 5) with Marked Points": Triangle_1_2_5,
    "Triangle (2, 3, 4)": Triangle_2_3_4,
  } as {[name: string]: string};

  get selected(): string {
    for(const [name, yaml] of Object.entries(this.predefined))
      if (yaml == this.$store.state.raw)
        return name;
    return "other";
  }

  set selected(name: string) {
    this.$store.dispatch("reset", {raw: this.predefined[name]});
  }
}
</script>
