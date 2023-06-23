/* ******************************************************************************
 * Copyright (c) 2021-2023 Julian Rüth <julian.rueth@fsfe.org>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * *****************************************************************************/

import wait from "@/wait";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";

import Layout from "@/layout/Layout";
import CancellationToken, {OperationAborted} from "@/CancellationToken";
import Progress from "@/Progress";
import LayoutOptions from "@/layout/LayoutOptions";
import Automorphism from "@/flatsurf/Automorphism";
import { PropType, defineComponent } from "vue";

async function runSilently(callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) {
  await callback(new CancellationToken(), new Progress());
}

export default defineComponent({
  inject: {
    run: {
      default: () => runSilently,
    }
  },
  name: "Layouter",

  emits: ["layout"],

  props: {
    triangulation: {
      type: Object as PropType<FlatTriangulation>,
      required: true,
    },

    automorphisms: {
      type: Array as PropType<Automorphism[]>,
      required: false,
      default: () => [],
    },
  },

  data() {
    return {
      previous: null as Layout | null,
      current: null as Layout | null,
      pendingRelayout: new CancellationToken()
    };
  },

  mounted() {
    this.relayout();
  },

  watch: {
    triangulation() {
      throw Error("triangulation for layout must not change; make sure to use a :key to recreate the layouter when the surface changes");
    },
    automorphisms() {
      throw Error("automorphisms for layout must not change; make sure to use a :key to recreate the layouter when the surface changes");
    },
  },

  render() {
    if (this.previous || this.current) {
      if (this.$slots.default)
        return this.$slots.default({
          layout: this.current || this.previous,
          relayout: this.relayout,
          ready: this.current != null,
        });
    }
  },

  methods: {
    async relayout(layoutOptions?: LayoutOptions): Promise<Layout> {
      if (layoutOptions === undefined)
        layoutOptions = new LayoutOptions(() => null, this.automorphisms);

      this.pendingRelayout.abort();

      if (this.current != null)
        this.previous = this.current;

      this.current = null;

      await (this as any).run(async (cancellation: CancellationToken, progress: Progress) => {
        this.pendingRelayout = cancellation;
        try {
          this.current = await Layout.layout(this.triangulation, layoutOptions!, cancellation, progress);
          this.$emit("layout", this.current);
        } catch (e) {
          if (e instanceof OperationAborted)
            return;
          throw e;
        }
      });

      return this.current! as Layout;
    },

    async query(when: "now" | "changed") {
      if (when === "changed")
        await wait(this as any, "effectiveLayout");
      return this.current;
    }
  }
});
