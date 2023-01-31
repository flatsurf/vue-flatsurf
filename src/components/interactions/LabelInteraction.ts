import VisualizationOptions from "../flatsurf/options/VisualizationOptions";
import Layout from "@/layout/Layout";
import Edge from "@/flatsurf/Edge";
import { defineComponent, PropType } from "vue";

function nextLabel(label: string) {
  let chars = label.split('').map((c) => c.charCodeAt(0) - 65);
  chars[chars.length - 1]++;
  for (let i = chars.length; i--;) {
    if (chars[i] == 25) {
      chars[i] = 0;
      if (i == 0)
        chars = [0, ...chars];
      else
        chars[i - 1]++;
    }
  }

  return chars.map((code) => String.fromCharCode(65 + code)).join('');
}

export default defineComponent({
  name: "LabelInteraction",

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

    numeric: {
      type: Boolean as PropType<boolean>,
      required: true,
    }
  },

  watch: {
    layout: {
      immediate: true,
      handler: "resetVisibility"
    },
    outer: "resetVisibility",
    numeric: "resetVisibility",
    options: "resetVisibility",
  },

  methods: {
    resetVisibility() {
      let alpha = "A";

      for (const halfEdge of this.layout.triangulation.halfEdges) {
        if (halfEdge < 0)
          continue;

        const edge = new Edge(halfEdge);

        if (this.outer) {
          if (!this.layout.layout(halfEdge).inner) {
            // TODO: Do not give labels to invisible components. See https://github.com/flatsurf/vue-flatsurf/issues/36.
            this.options.label(halfEdge, alpha);
            this.options.label(-halfEdge, alpha);
            this.options.label(edge, null);
            alpha = nextLabel(alpha);
            continue;
          }
        }
        if (this.numeric) {
          this.options.label(halfEdge, String(halfEdge));
          this.options.label(-halfEdge, this.layout.layout(halfEdge).inner ? null : String(-halfEdge));
          this.options.label(edge, String(edge.positive));
          continue;
        }

        this.options.label(halfEdge, null);
        this.options.label(-halfEdge, null);
        this.options.label(edge, null);
      }
    }
  },

  render() {}
});

