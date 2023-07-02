<!--
  Displays a loading modal while computations are performed.
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
  <v-overlay class="align-center justify-center" :opacity=".2" :model-value="visible" :z-index="0">
    <v-container>
      <v-row>
        <v-col>
          {{ name }}…
          <v-progress-circular :indeterminate="value == null" :value="value" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn color="error" dark :disabled="cancellation ? cancellation.cancelled : true" @click="() => cancellation!.cancel()">Cancel</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-overlay>
</template>
<script lang="ts">
import CancellationToken from "@/CancellationToken";
import Progress from "@/Progress";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "Overlay",

  props: {
    cancellation: {
      type: CancellationToken as PropType<CancellationToken | null>,
      required: false,
      default: null
    },

    progress: {
      type: Progress as PropType<Progress | null>,
      required: false,
      default: null
    }
  },

  data() {
    return {
      visible: false
    };
  },

  computed: {
    name(): string {
      return this.progress!.stats.name;
    },

    value(): number | null {
      if (this.progress!.stats.step == null || this.progress!.stats.steps == null)
        return null;
      return this.progress!.stats.step / this.progress!.stats.steps * 100;
    },
  },

  watch: {
    cancellation: {
      immediate: true,

      handler(value: CancellationToken) {
        if (value == null)
          this.visible = false;
        else
          setTimeout(() => {
            if (this.cancellation === value)
              this.visible = true
          }, 150);
      }
    }
  }
});
</script>
<style scoped>
.container {
  text-align: center;
}

.container:deep(.v-progress-circular__overlay) {
  transition: all 0.1s ease-in-out;
}
</style>
