import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import VisualizationOptions from "../flatsurf/options/VisualizationOptions";
import Layout from "@/layout/Layout";

@Component
export default class TriangulationVisibilityInteraction extends Vue {
  @Prop({ required: true, type: Object }) options!: VisualizationOptions;
  @Prop({ required: true, type: Object }) layout!: Layout;
  @Prop({ required: false, default: true, type: Boolean }) outer!: boolean;
  @Prop({ required: false, default: false, type: Boolean }) inner!: boolean;

  @Watch("layout", {immediate: true})
  @Watch("outer")
  @Watch("inner")
  @Watch("options")
  resetVisiblity() {
    for (const halfEdge of this.layout.surface.halfEdges)
      if (this.layout.layout(halfEdge).inner)
        this.options.show(halfEdge, this.inner);
      else
        this.options.show(halfEdge, this.outer);
  }

  render() {}
}
