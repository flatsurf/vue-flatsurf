import VisualizationOptions from "../flatsurf/options/VisualizationOptions";
import Layout from "@/layout/Layout";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  name: "TriangulationInteraction",

  props: {
    options: {
      type: Object as PropType<VisualizationOptions>,
      required: true
    },

    layout: {
      type: Object as PropType<Layout>,
      required: true
    },

    outer: {
      type: Boolean as PropType<boolean>,
      required: true,
    },

    inner: {
      type: Boolean as PropType<boolean>,
      required: true,
    }
  },

  watch: {
    layout: {
      immediate: true,
      handler: "resetVisibility",
    },
    outer: "resetVisibility",
    inner: "resetVisibility",
    options: "resetVisibility",
  },

  methods: {
    resetVisibility() {
      for (const halfEdge of this.layout.triangulation.halfEdges)
        this.options.show(halfEdge, this.layout.layout(halfEdge).inner ? false : this.outer);

      for (const edge of this.layout.triangulation.edges)
        this.options.show(edge, this.layout.layout(edge.positive).inner ? this.inner : false);
    }
  },

  render() {}
});
