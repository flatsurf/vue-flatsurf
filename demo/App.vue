<!--
  A demo application that lets the user play with a YAML serialized surface.
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
  <v-app>
    <v-main>
      <v-container class="container" fluid>
        <router-view />
      </v-container>
      <router-view name="menu" />
      <overlay-component :cancellation="overlay" :progress="progress" />
    </v-main>
    <bottom-navigation />
  </v-app>
</template>
<script setup lang="ts">
import CancellationToken from "@/CancellationToken";
import Progress from "@/Progress";
import OverlayComponent from "./Overlay.vue";
import BottomNavigation from "./BottomNavigation.vue";
import { provide, watch, shallowRef } from "vue";
import type { Ref } from "vue";
import { useStore } from "vuex";

const overlay = shallowRef(null) as Ref<CancellationToken | null>;
const progress = shallowRef(null) as Ref<Progress | null>;

const props = defineProps({
  surface: {
    type: String,
    required: true,
  }
});

const store = useStore();

watch(() => props.surface, (raw: string) => {
    store.dispatch("reset", { raw });
}, { immediate: true });

provide("run", async (
    callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>
  ) => {
    // Any previous run is supposedly cancelled already so we can safely throw
    // away its cancellation and progress tokens.
    const cancellation = new CancellationToken();
    overlay.value = cancellation;
    progress.value = new Progress();
    try {
      await callback(overlay.value as CancellationToken, progress.value as Progress);
    } finally {
      if (overlay.value === cancellation) {
        // We came here because this process completed. Remove the overlay.
        overlay.value = null;
      }
    }
  }
)
</script>
<style scoped>
.container {
  height: 100%;
}

.surface {
  display: inline-block;
  height: 100%;
  width: 100%;
}

.container {
  padding: 0;
}
</style>
