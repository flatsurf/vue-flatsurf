/* ******************************************************************************
 * Copyright (c) 2021 Julian Rüth <julian.rueth@fsfe.org>
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

import { Component, Inject, Prop, Vue, Watch } from "vue-property-decorator";

import wait from "@/wait";

import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import Layout from "@/layout/Layout";
import CancellationToken, {OperationAborted} from "@/CancellationToken";
import Progress from "@/Progress";
import LayoutOptions from "@/layout/LayoutOptions";
import Automorphism from "@/flatsurf/Automorphism";

async function run(callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) {
  await callback(new CancellationToken(), new Progress());
}

@Component
export default class Layouter extends Vue {
  @Prop({ required: true, type: Object }) triangulation!: FlatTriangulation;
  @Prop({ required: false, type: Array, default: () => [] }) automorphisms!: Automorphism[];
  @Prop({ required: false, type: Object, default: null }) layout!: Layout | null;

  options: LayoutOptions = new LayoutOptions();
  effectiveLayout: Layout | null = null;

  @Inject({ from: 'run', default: run })
  run!: (callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) => Promise<void>;

  render() {
    if (this.effectiveLayout != null) {
      return this.$scopedSlots.default!({
        layout: this.effectiveLayout,
        relayout: this.relayout,
      });
    }
  }

  private pendingRelayout = new CancellationToken();

  async relayout(layoutOptions?: LayoutOptions): Promise<Layout> {
    if (layoutOptions === undefined) {
      if (this.effectiveLayout != null)
        return this.effectiveLayout;
      layoutOptions = new LayoutOptions(() => null, this.automorphisms);
    }

    this.options = layoutOptions;

    this.pendingRelayout.abort();
    await this.run(async (cancellation, progress) => {
      this.pendingRelayout = cancellation;
      try {
        this.effectiveLayout = await Layout.layout(this.triangulation, this.options, cancellation, progress);
      } catch (e) {
        if (e instanceof OperationAborted) return;
        throw e;
      }
    });

    this.$emit("layout", this.effectiveLayout);
    return this.effectiveLayout!;
  }

  @Watch("triangulation", { immediate: true })
  onSurfaceChanged() {
    this.effectiveLayout = this.layout;
    this.relayout();
  }

  public async query(when: "now" | "changed") {
    if (when === "changed")
      await wait(this, "effectiveLayout");
    return this.effectiveLayout;
  }
}
