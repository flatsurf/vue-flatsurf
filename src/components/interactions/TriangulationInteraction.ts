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

import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import VisualizationOptions from "../flatsurf/options/VisualizationOptions";
import Layout from "@/layout/Layout";

@Component
export default class TriangulationInteraction extends Vue {
  @Prop({ required: true, type: Object }) options!: VisualizationOptions;
  @Prop({ required: true, type: Object }) layout!: Layout;
  @Prop({ required: false, default: true, type: Boolean }) outer!: boolean;
  @Prop({ required: false, default: false, type: Boolean }) inner!: boolean;

  @Watch("layout", {immediate: true})
  @Watch("outer")
  @Watch("inner")
  @Watch("options")
  resetVisiblity() {
    for (const halfEdge of this.layout.triangulation.halfEdges)
      this.options.show(halfEdge, this.layout.layout(halfEdge).inner ? false : this.outer);

    for (const edge of this.layout.triangulation.edges)
      this.options.show(edge, this.layout.layout(edge.positive).inner ? this.inner : false);
  }

  render() {}
}
