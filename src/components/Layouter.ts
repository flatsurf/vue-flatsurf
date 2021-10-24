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

  options: LayoutOptions = new LayoutOptions();
  layout: Layout | null = null;

  @Inject({ from: 'run', default: run })
  run!: (callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) => Promise<void>;

  render() {
    if (this.layout != null) {
      return this.$scopedSlots.default!({
        layout: this.layout,
        relayout: this.relayout,
      });
    }
  }

  private pendingRelayout = new CancellationToken();

  async relayout(layoutOptions?: LayoutOptions): Promise<Layout> {
    if (layoutOptions === undefined) {
      if (this.layout != null)
        return this.layout;
      layoutOptions = new LayoutOptions(() => null, this.automorphisms);
    }

    this.options = layoutOptions;

    this.pendingRelayout.abort();
    await this.run(async (cancellation, progress) => {
      this.pendingRelayout = cancellation;
      try {
        // TODO: Relayout in a way that keeps the previous picture intact, e.g., by leaving the selected half edge in the same place.
        this.layout = await Layout.layout(this.triangulation, this.options, cancellation, progress);
        this.$emit("layout", this.layout);
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
      
      /* TODO
      this.$nextTick(() => {
        // TODO: Maybe we should not always export the SVG but only do so on demand.
        const exporter = new SVGExporter(this.$refs.svg as HTMLElement);
        exporter.simplifyColors();
        exporter.dropNonStandardStyles();
        exporter.dropNonInkscapeStyles();
        exporter.dropTrivialStyles();
        exporter.dropRedundantStyles();
        exporter.dropClasses();
        exporter.dropPrefixedStyles();
        exporter.dropInvisible();
        exporter.dropInteractiveStyles();
        exporter.dropCustomAttributes();
        exporter.usePresentationAttributes();
        exporter.inlineStyles();
        this.$emit('svg', exporter.toString());
      });
      */
    });

    return this.layout!;
  }


  @Watch("triangulation", { immediate: true })
  onSurfaceChanged() {
    this.layout = null;
    this.relayout();
  }
}
