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
import Torus from "./torus.txt?raw";
import Triangle_1_1_1 from "./1-1-1.txt?raw";
import Triangle_1_1_3 from "./1-1-3.txt?raw";
import Triangle_1_1_3_Without_Marked_Point from "./1-1-3-without-marked-point.txt?raw";
import Triangle_1_2_2 from "./1-2-2.txt?raw";
import Triangle_1_2_2_Without_Marked_Point from "./1-2-2-without-marked-point.txt?raw";
import Triangle_1_2_5 from "./1-2-5.txt?raw";
import Triangle_2_3_4 from "./2-3-4.txt?raw";
import Disconnected from "./disconnected.txt?raw";
import Quadrilateral_1_2_2_1 from "./1_2_2_1.txt?raw";

import { defineComponent } from "vue";

export default defineComponent({
  name: "EditorMenu",

  data: () => ({
    predefined: {
      "Torus": Torus,
      "Triangle (1, 1, 1)": Triangle_1_1_1,
      "Triangle (1, 1, 3) with Marked Points": Triangle_1_1_3,
      "Triangle (1, 1, 3) w/o Marked Points": Triangle_1_1_3_Without_Marked_Point,
      "Triangle (1, 2, 2) with Marked Points": Triangle_1_2_2,
      "Triangle (1, 2, 2) w/o Marked Points": Triangle_1_2_2_Without_Marked_Point,
      "Triangle (1, 2, 5) with Marked Points": Triangle_1_2_5,
      "Triangle (2, 3, 4)": Triangle_2_3_4,
      "Disconnected Surface": Disconnected,
      "Quadrilateral (1, 2, 2, 1) as a Raw Flatsurf String": Quadrilateral_1_2_2_1,
    } as {[name: string]: string}
  }),

  computed: {
    selected: {
      get (): string {
        for(const [name, yaml] of Object.entries(this.predefined))
          if (yaml == this.$store.state.raw)
            return name;
        return "other";
      },
      set(value: string) {
        this.$store.dispatch("reset", {raw: this.predefined[value]});
      }
    }
  }
});
</script>
