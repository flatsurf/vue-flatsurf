<!--

A reactive SVG that displays a Flat Triangulation.

TODO: It is weird that we compute the layout in the flat-triangulation-component and do not inject it from the outside.

-->
<template>
  <div>
    <svg :width="viewport.width" :height="viewport.height" ref="svg">
      <g v-if="layout != null">
        <flow-component-component v-for="(component, i) of components" :key="i" :color="palette.color(i)" :component="component" :layout="layout" :surface="surface" />
      </g>
      <flat-triangulation-component v-if="layout != null" :surface="layout" />
    </svg>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Provide, Inject, Watch } from "vue-property-decorator";

import Viewport from "../geometry/Viewport";
import FlatTriangulation from "../geometry/triangulation/FlatTriangulation";
import FlatTriangulationComponent from "./FlatTriangulation.vue";
import HalfEdge from "../geometry/triangulation/HalfEdge";
import FlowComponent from "../geometry/triangulation/FlowComponent";
import FlowComponentComponent from "./FlowComponent.vue";
import Palette from "@/Palette";

import Point from "@/geometry/Point";
import Vector from "@/geometry/Vector";
import Segment from "@/geometry/Segment";
import FlatTriangulationLayout from '@/geometry/layout/FlatTriangulationLayout';
import { IHalfEdgeConfiguration } from "./HalfEdgeConfiguration";

import CancellationToken, { OperationAborted } from "@/CancellationToken";
import Progress from "@/Progress";

import SVGExporter from "@/export/SVGExporter";

@Component({
  components: {
    FlatTriangulationComponent,
    FlowComponentComponent,
  }
})
export default class Surface extends Vue {
  @Prop({ required: true }) viewport!: Viewport;
  @Prop({ required: true }) surface!: FlatTriangulation;
  @Prop({ required: false, default: () => [], type: Array }) components!: FlowComponent[];
  @Prop({ required: false, default: () => [], type: Array }) inner!: HalfEdge[];
  
  private forced = [] as HalfEdge[];
  private selected = [] as HalfEdge[];
  private hovered = [] as HalfEdge[];
  private indicator = {} as Record<HalfEdge, number | null>;
  private cancellation = new CancellationToken();
  private layout = null as FlatTriangulationLayout | null;

  // TODO: It is a strange pattern to hide the updates behind the layout updates.
  palette = new Palette();

  static _run(callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>): void {
    callback(new CancellationToken(), new Progress());
  }

  @Inject({ from: 'run', default: () => Surface._run})
  run!: (callback: (cancellation: CancellationToken, progress: Progress) => Promise<void>) => void;

  created() {
    this.relayout();
  }

  async relayout() {
    this.cancellation.abort();
    this.run(async (cancellation, progress) => {
      this.cancellation = cancellation;
      try {
        this.layout = await FlatTriangulationLayout.layout(this.surface, (he: HalfEdge) => (this.forced.includes(he) || this.forced.includes(-he)) ? true : null, this.cancellation, progress);
      } catch (e) {
        if (e instanceof OperationAborted) return;
        throw e;
      }
      this.palette = new Palette(this.components.length);
      this.$emit('layout', this.layout);
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
    });

  }

  @Provide()
  svg(xy: Vector | Point | Segment) : Vector | Point | Segment {
    if (xy instanceof Vector)
      return this.viewport.viewportCoordinateSystem.embed(xy);
    if (xy instanceof Point)
      return this.viewport.viewportCoordinateSystem.embed(xy);
    if (xy instanceof Segment)
      return this.viewport.viewportCoordinateSystem.embed(xy);
    throw new Error("Cannot embed this type into the SVG coordinate system yet.");
  }

  @Watch("forced")
  onForcedChanged() {
    this.relayout();
  }

  @Watch("inner", {immediate: true})
  onInnerChanged() {
    this.forced = this.inner;
  }

  forceHalfEdge(halfEdge: HalfEdge) {
    this.forced.push(halfEdge);
  }

  async glue(halfEdge: HalfEdge) {
    if (this.forced.includes(halfEdge) || this.forced.includes(-halfEdge))
      this.forced = this.forced.filter((he) => he !== halfEdge && he !== -halfEdge);
    else
      this.forced.unshift(halfEdge);

    this.selected.push(halfEdge); 

    await new Promise(resolve => this.$once("layout", resolve));

    await new Promise(resolve => setTimeout(resolve, 500));

    this.selected = this.selected.filter((he) => he !== halfEdge && he !== -halfEdge);
  }

  hover(halfEdge: HalfEdge, at: number) {
    this.hovered.push(halfEdge);
    this.indicator[halfEdge] = at;
    this.indicator[-halfEdge] = 1 - at;
  }

  unhover(halfEdge: HalfEdge) {
    this.hovered = this.hovered.filter((he) => he !== halfEdge && he !== -halfEdge);
    this.indicator[halfEdge] = null;
    this.indicator[-halfEdge] = null;
  }

  // TODO: This should live in a more generic place.
  private relativizeOntoSegment(segment: Segment, point: Point): number {
    const e = segment.value.tangentInStart();
    const toPoint = new Vector(segment.parent, segment.start, point).value;
    return e.dot(toPoint) / segment.value.length;
  }

  // TODO: This is a weird name.
  @Provide()
  halfEdgeConfiguration(halfEdge: HalfEdge): IHalfEdgeConfiguration {
    return {
      interactions: {
        click: () => {
          this.unhover(halfEdge)
          this.glue(halfEdge)
        },
        // TODO: This assumes that this component fills the viewport coordinate system. That's probably always in practice true but maybe we should inject the offset.
        enter: (ev: MouseEvent, segment: Segment) => this.hover(halfEdge, this.relativizeOntoSegment(segment, new Point(this.viewport.viewportCoordinateSystem, ev.clientX - this.$el.getBoundingClientRect().left, ev.clientY - this.$el.getBoundingClientRect().top))),
        leave: () => this.unhover(halfEdge),
        hover: (ev: MouseEvent, segment: Segment) => this.hover(halfEdge, this.relativizeOntoSegment(segment, new Point(this.viewport.viewportCoordinateSystem, ev.clientX - this.$el.getBoundingClientRect().left, ev.clientY - this.$el.getBoundingClientRect().top))),
      },
      state: {
        selected: this.selected.includes(halfEdge) || this.selected.includes(-halfEdge),
        glued: this.forced.includes(halfEdge) || this.forced.includes(-halfEdge),
        labeled: this.hovered.includes(halfEdge) || this.hovered.includes(-halfEdge),
        indicator: this.indicator[halfEdge],
      },
    };
  }
}
</script>
