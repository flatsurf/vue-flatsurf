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

    layout: {
      type: Object as PropType<Layout | null>,
      required: false,
      default: null,
    }
  },

  data() {
    return {
      options: new LayoutOptions(),
      effectiveLayout: null as Layout | null,
      pendingRelayout: new CancellationToken()
    };
  },

  watch: {
    triangulation: {
      immediate: true,

      handler() {
        this.effectiveLayout = this.layout;
        this.relayout();
      }
    }
  },

  render(this: any) {
    if (this.effectiveLayout != null && this.$scopedSlots.default != null) {
      return this.$scopedSlots.default({
        layout: this.effectiveLayout,
        relayout: this.relayout,
      });
    }
  },

  methods: {
    async relayout(layoutOptions?: LayoutOptions): Promise<Layout> {
      if (layoutOptions === undefined) {
        if (this.effectiveLayout != null)
          return this.effectiveLayout as Layout;
        layoutOptions = new LayoutOptions(() => null, this.automorphisms);
      }

      this.options = layoutOptions;

      this.pendingRelayout.abort();
      await (this as any).run(async (cancellation: CancellationToken, progress: Progress) => {
        this.pendingRelayout = cancellation;
        try {
          this.effectiveLayout = await Layout.layout(this.triangulation, this.options as LayoutOptions, cancellation, progress);
          this.$emit("layout", this.effectiveLayout);
        } catch (e) {
          if (e instanceof OperationAborted)
            return;
          throw e;
        }
      });

      return this.effectiveLayout! as Layout;
    },

    async query(when: "now" | "changed") {
      if (when === "changed")
        await wait(this as any, "effectiveLayout");
      return this.effectiveLayout;
    }
  }
});
