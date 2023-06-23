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
