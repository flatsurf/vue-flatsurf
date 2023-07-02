<!--
  A menu to select one of several predefined surfaces.
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
  <v-navigation-drawer permanent app>
    <v-list :selected="[selected]" @click:select="({id}) => selected = id as string" nav dense>
      <v-list-subheader>
        PREDEFINED SURFACES
      </v-list-subheader>
      <v-list-item v-for="name of Object.keys(predefined)" :key="name" :value="name">
        <v-list-item-title v-text="name"></v-list-item-title>
      </v-list-item>
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

  data() {
    return {
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
    }
  },

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
<style scoped>
* {
  user-select: none;
}
</style>
