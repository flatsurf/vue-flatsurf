<template>
  <g>
    <g :style="{ '--color': color }">
      <ngon v-for="(vertices, i) of patches" :key="i" :vertices="vertices" />
    </g>
    <g class="boundary">
      <saddle-connection-component v-for="(connection, i) of perimeter" :key="i" :connection="connection" :layout="layout" color="red" />
    </g>
  </g>
</template>
<script lang="ts">
import  { Vue, Component, Prop, Watch } from "vue-property-decorator";
import FlowComponentData from "../geometry/triangulation/FlowComponent";
import { Touch } from "../geometry/triangulation/FlowConnection";
import SaddleConnectionComponent from "./SaddleConnection.vue";
import FlatTriangulationLayout from "../geometry/layout/FlatTriangulationLayout";
import Ngon from "./svg/Ngon.vue";
import HalfEdge from "../geometry/triangulation/HalfEdge";
import Point from "../geometry/Point";
import FlatTriangulation from "../geometry/triangulation/FlatTriangulation";

@Component({
  components: {
    SaddleConnectionComponent,
    Ngon,
  },
})
export default class FlowComponent extends Vue {
  @Prop({ required: true }) component!: FlowComponentData;
  @Prop({ required: true }) layout!: FlatTriangulationLayout;
  @Prop({ required: true }) surface!: FlatTriangulation;
  @Prop({ required: false, type: String, default:"orange" }) color!: string;

  ats!: {[key: number]: number[]};
  nexts!: {[key: number]: Touch[]};

  get perimeter() {
    return this.component.perimeter.filter((connection) => connection.boundary).map((connection) => connection.connection);
  }

  @Watch("layout", { immediate: true })
  resetCaches() {
    this.ats = undefined as any;
    this.nexts = undefined as any;
    this.ensureCaches();
  }

  ensureCaches() {
    if (this.nexts == null) {
      this.nexts = {};
      for (const connection of this.component.perimeter) {
        for (const touch of connection.touches) {
          if (this.nexts[touch.halfEdge] === undefined) this.nexts[touch.halfEdge] = [];
          this.nexts[touch.halfEdge][touch.index] = touch;
        }
      }
    }
    if (this.ats == null) {
      this.ats = {};
      for (const connection of this.component.perimeter) {
        for (let i = 0; i < connection.touches.length; i++) {
          const touch = connection.touches[i];
          let at = 0;
          if (i != 0 && i != connection.touches.length - 1) {
            at = connection.connection.crossings[Math.floor((i - 1) / 2)].at;
            if (i % 2 == 0)
              at = 1 - at;
          }
          if (this.ats[touch.halfEdge] === undefined) this.ats[touch.halfEdge] = [];
          this.ats[touch.halfEdge][touch.index] = at;
        }
      }
    }
  }

  private delta(touch: Touch, d: number): Touch {
    console.assert(this.nexts != null);
    const ret = this.nexts[touch.halfEdge][touch.index + d];
    if (ret === undefined)
      throw Error("Half edge is not touched at that point in this component.");
    return ret;
  }

  // Return the relative length in [0, 1] where `touch` intersects its half edge.
  private at(touch: Touch): number {
    console.assert(this.ats != null);
    return this.ats[touch.halfEdge][touch.index];
  }

  // Return the triangle [A, B, C] completing the two touches `a`, `b`.
  private patch(a: Touch, b: Touch): Point[] {
    // Given `at` in [0, 1] returns the actual point on `halfEdge` that is that far on `halfEdge`.
    const layout = (halfEdge: HalfEdge, at: number) => this.layout.layout(halfEdge).segment.at(at);

    const A = layout(a.halfEdge, this.at(a));
    let B = layout(b.halfEdge, this.at(b));

    const face = [a.halfEdge, this.surface.faces.image(a.halfEdge), this.surface.faces.preimage(a.halfEdge)];

    const isHalfEdge = a.halfEdge === -b.halfEdge;

    let search = b;
    if (!isHalfEdge) {
      console.assert(a.halfEdge !== b.halfEdge, `Saddle Connection cannot cross the half edge ${a.halfEdge} twice in a row.`);
      console.assert(face.includes(b.halfEdge), `Saddle Connection cannot go from half edge ${a.halfEdge} to ${b.halfEdge} since they are not in the same face`);
    } else {
      console.assert(this.at(a) === 0, "Edge-parallel connection must start at vertex.")
      console.assert(this.at(b) === 0, "Edge-parallel connection must end at vertex.");
      B = layout(a.halfEdge, 1);
      search = { halfEdge: face[1], index: -1 };
    }

    let C = layout(search.halfEdge, 1);
    // TODO: Do not try catch in expected control flow.
    try {
      let c = this.delta(search, 1);
      C = layout(c.halfEdge, this.at(c)); 
    } catch {
      console.log("ABC");
    }

    console.assert(!A.equalTo(B), `Patch has the same point twice ${A.toString()} == ${B.toString()}.`);
    console.assert(!A.equalTo(C), `Patch has the same point twice ${A.toString()} == ${C.toString()}.`);
    console.assert(!B.equalTo(C), `Patch has the same point twice ${B.toString()} == ${C.toString()}.`);

    return [A, B, C];
  }

  get patches() {
    let /* TODO const */ patches = [];

    for (const connection of this.component.perimeter) {
      for (let i = 0; i < connection.touches.length; i+=2) {
        patches.push(this.patch(connection.touches[i], connection.touches[i + 1]));
      }
    }

    // patches = patches.filter((_, i) => i === 0);

    return patches;
  }
}
</script>
<style scoped>
polygon {
  fill: var(--color);
  opacity: .6;
  stroke: black;
  stroke-width: 3px;
}

.boundary {
  opacity: .8;
}
</style>
