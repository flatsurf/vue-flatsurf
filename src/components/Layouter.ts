import { Component, Inject, Prop, Vue, Watch } from "vue-property-decorator";

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
        // TODO: Relayout in a way that keeps the previous picture intact, e.g., by leaving the selected half edge in the same place.
        this.effectiveLayout = await Layout.layout(this.triangulation, this.options, cancellation, progress);
      } catch (e) {
        if (e instanceof OperationAborted) return;
        throw e;
      }
      
      // Only display components whose half edges and faces have been rendered.
      /* TODO
      this.components = this.parsed.components.filter((component) =>
        !component.perimeter.some((connection: FlowConnection) =>
          ! this.layout!.primary.includes(connection.connection.source) && !this.layout!.primary.includes(connection.connection.target)
        )
      );
      */
    });

    this.$emit("layout", this.effectiveLayout);
    return this.effectiveLayout!;
  }


  @Watch("triangulation", { immediate: true })
  onSurfaceChanged() {
    this.effectiveLayout = this.layout;
    this.relayout();
  }
}
