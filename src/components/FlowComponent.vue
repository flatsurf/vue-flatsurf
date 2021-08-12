<template>
  <g class="FlowComponent">
    <g :style="{ '--color': color }">
      <ngon v-for="(vertices, i) of patches" :key="i" :vertices="vertices" />
    </g>
    <g class="boundary">
      <saddle-connection-component v-for="(connection, i) of perimeter" :key="i" :connection="connection" :layout="layout" :color="color" />
    </g>
  </g>
</template>
<script lang="ts">
import Flatten from "@flatten-js/core";
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
  // Maps a half edge to the touches on that half edge in order.
  touches!: {[key: number]: Touch[]};

  get perimeter() {
    let perimeter = this.component.perimeter;
    if (this.component.cylinder)
      // For cylinders do not show the connections at the top & bottom of the cylinder.
      perimeter = perimeter.filter((connection) => connection.vertical);
    else
      // For minimal/undetermined components, do not show the inner structure of the component.
      perimeter = perimeter.filter((connection) => connection.boundary);

    return perimeter.map((connection) => connection.connection);
  }

  @Watch("layout", { immediate: true })
  resetCaches() {
    this.ats = undefined as any;
    this.touches = undefined as any;
  }

  ensureCaches() {
    if (this.touches == null) {
      this.touches = {};
      for (const halfEdge of this.surface.halfEdges)
        this.touches[halfEdge] = [];

      for (const connection of this.component.perimeter) {
        for (const touch of connection.touches) {
          this.touches[touch.halfEdge][touch.index] = touch;
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

  // Return the relative length in [0, 1] where `touch` intersects its half edge.
  private at(touch: Touch): number {
    console.assert(this.ats != null);
    return this.ats[touch.halfEdge][touch.index];
  }

  // Return the triangle [A, B, C] completing the two touches `a`, `b`.
  private patch(a: Touch, b: Touch): Point[] | null {
    // Given `at` in [0, 1] returns the actual point on `halfEdge` that is that far on `halfEdge`.
    const layout = (halfEdge: HalfEdge, at: number) => this.layout.layout(halfEdge).segment.at(at);

    const isHalfEdge = a.halfEdge === -b.halfEdge;

    const A = layout(a.halfEdge, this.at(a));
    let B = isHalfEdge ? layout(a.halfEdge, 1) : layout(b.halfEdge, this.at(b));
    let C = B;

    let scenario = "undefined";

    if (isHalfEdge) {
      console.assert(this.at(a) === 0, "Edge-parallel connection must start at vertex.")
      console.assert(this.at(b) === 0, "Edge-parallel connection must end at vertex.");
    } else {
      console.assert(a.halfEdge !== b.halfEdge, `Saddle Connection cannot cross the half edge ${a.halfEdge} twice in a row.`);
    }

    const atouches = this.touches[a.halfEdge];
    const btouches = this.touches[b.halfEdge];

    if (isHalfEdge) {
      return null;
    } else {
      if (b.index === btouches.length - 1) {
        if (this.at(b) === 1) {
          // The vertex B of the patch is an actual vertex of the triangulation. We will search for C on A's half edge.

          // Search for C on A's half edge.
          console.assert(this.at(a) !== 0);
          if (a.index === 0) {
            // Everything next to A is part of this patch.
            console.assert(this.at(a) !== 0);
            C = layout(a.halfEdge, 0);
          } else {
            C = layout(a.halfEdge, this.at(atouches[a.index - 1]));
          }
        } else {
          // Everything next to B is part of this patch.
          scenario = "remaining face";
          C = layout(b.halfEdge, 1);
          if (this.at(b) === 0)
            return null;
        }
      } else {
        if (this.at(b) === this.at(btouches[b.index + 1])) {
          // The vertex B of this patch is a vertex of the component.
          console.assert(this.at(b) === 0 || this.at(b) === 1, "Vertices of components must be aligned with the vertices of the triangulation.");

          // Search for C on A's half edge.
          console.assert(this.at(a) !== 0);
          if (a.index === 0) {
            // Everything next to A is part of this patch.
            console.assert(this.at(a) !== 0);
            // TODO: Is this always taken care of by something else?
            C = layout(a.halfEdge, 0);
            return null;
          } else {
            // TODO: Is this always taken care of by something else?
            C = layout(a.halfEdge, this.at(atouches[a.index - 1]));
            return null;
          }
        } else {
          console.assert(this.at(btouches[b.index + 1]) > this.at(b), `Touches are not ordered correctly on half edge ${b.halfEdge}. The ${btouches[b.index + 1].index}th touch at ${this.at(btouches[b.index + 1])} should not be after the ${b.index}th touch at ${this.at(b)}.`);
          C = layout(b.halfEdge, this.at(btouches[b.index + 1]));
        }
      }
    }

    console.assert(!A.equalTo(B), `Patch of kind '${scenario}' coming from the touches (${a.halfEdge}, ${a.index}) at ${this.at(a)} and (${b.halfEdge}, ${b.index}) at ${this.at(b)} has the same point twice A == B, i.e., ${A.toString()} == ${B.toString()}.`);
    console.assert(!A.equalTo(C), `Patch of kind '${scenario}' coming from the touches (${a.halfEdge}, ${a.index}) at ${this.at(a)} and (${b.halfEdge}, ${b.index}) at ${this.at(b)} has the same point twice A == C, i.e., ${A.toString()} == ${C.toString()}.`);
    console.assert(!B.equalTo(C), `Patch of kind '${scenario}' coming from the touches (${a.halfEdge}, ${a.index}) at ${this.at(a)} and (${b.halfEdge}, ${b.index}) at ${this.at(b)} has the same point twice B == C, i.e., ${B.toString()} == ${C.toString()}.`);

    return [A, B, C];
  }

  private patchHalfEdge(halfEdge: HalfEdge): Point[] | null {
    // Given `at` in [0, 1] returns the actual point on `halfEdge` that is that far on `halfEdge`.
    const layout = (halfEdge: HalfEdge, at: number) => this.layout.layout(halfEdge).segment.at(at);

    const face = [halfEdge, this.surface.faces.image(halfEdge), this.surface.faces.preimage(halfEdge)];

    const A = layout(halfEdge, 0);
    const B = layout(halfEdge, 1);
    let C = B;
    let scenario = "undefined";

    // Search for the third point of the patch on the following half edge in the face.
    let touches = this.touches[face[1]]
    if (touches.length === 0) {
      // Since nothing intersects the following half edge in this face, this
      // patch is the entire face.
      scenario = "entire face";
      C = layout(face[1], 1);
      if (face[0] !== Math.min(...face))
        return null;
    } else if (this.at(touches[0]) === 0) {
      // Something starts at the vertex joining this half edge with the
      // following half edge...
      touches = this.touches[-face[2]];
      if (touches.every((touch) => this.at(touch) === 0 || this.at(touch) === 1)) {
        // ...it is just the following half edge itself.
        scenario = "entire face 2";
        // TODO: Is this always taken care of by something else?
        C = layout(face[1], 1);
        if (face[0] !== Math.min(...face))
          return null;
      } else {
        // It's another connection. So the patch ends at the beginning of the
        // next half edge, none of that half edge is in the patch, i.e., the
        // third point of the patch must be on the other half edge of this
        // face.
        scenario = "on previous half edge";
        for (const touch of touches) {
          if (this.at(touch) !== 0) {
            // TODO: Is this always taken care of by something else?
            C = layout(face[2], 1 - this.at(touch));
            return null;
            break;
          }
        }
      }
    } else {
      scenario = "on following half edge";
      C = layout(face[1], this.at(touches[0]));
    }

    console.assert(!A.equalTo(B), `Patch of kind '${scenario}' coming from the half edge ${halfEdge} has the same point twice A == B, i.e., ${A.toString()} == ${B.toString()}.`);
    console.assert(!A.equalTo(C), `Patch of kind '${scenario}' coming from the half edge ${halfEdge} has the same point twice A == C, i.e., ${A.toString()} == ${C.toString()}.`);
    console.assert(!B.equalTo(C), `Patch of kind '${scenario}' coming from the half edge ${halfEdge} has the same point twice B == C, i.e., ${B.toString()} == ${C.toString()}.`);

    return [A, B, C];
  }

  get triangles(): Point[][] {
    const triangles = [];

    for (const connection of this.component.perimeter) {
      for (let i = 0; i < connection.touches.length; i+=2) {
        const patch = this.patch(connection.touches[i], connection.touches[i + 1])
        if (patch !== null)
          triangles.push(patch);
      }
    }

    for (const inside of this.component.inside) {
      const patch = this.patchHalfEdge(inside);
      if (patch != null)
        triangles.push(patch);
    }

    return triangles;
  }

  get patches(): Point[][] {
    const patches = [];
    const triangles = [...this.triangles];

    const epsilon = (Flatten.Utils as any).getTolerance();

    // Glue triangle to ngon if possible.
    const glue = (ngon: Point[], triangle: Point[]) => {
      console.assert(triangle.length === 3);
      for (const step of [1, 2]) {
        for (const t of [0, 1, 2]) {
          for (let n = 0; n < ngon.length; n++) {
            if (triangle[t].equalTo(ngon[n], epsilon) && triangle[(t + step) % 3].equalTo(ngon[(n + 1) % ngon.length], epsilon)) {
              // Add the third point of the triangle that gets glued to the ngon.
              ngon.splice(n + 1, 0, triangle[(t + 2*step) % 3]);

              // Simplify the ngon if it contains the same point twice.
              for (let nn = 0; nn < ngon.length; nn++) {
                if (ngon[nn].equalTo(ngon[(nn + 2) % ngon.length], epsilon)) {
                  if (nn + 1 == ngon.length) {
                    ngon.splice(0, 2);
                  } else if (nn + 2 == ngon.length) {
                    ngon.splice(0, 1);
                    ngon.pop();
                  } else
                    ngon.splice(nn, 2);
                  break;
                }
              }

              return true;
            }
          }
        }
      }

      return false;
    };

    while(triangles.length) {
      // Create an ngon by gluing triangles that share two points.
      let patch = triangles.pop()!;
      for (let t = triangles.length; t--;) {
        if (glue(patch, triangles[t])) {
          triangles[t] = triangles[triangles.length - 1];
          triangles.pop();
          t = triangles.length;
        }
      }

      patches.push(patch);
    }

    return patches;
  }
}
</script>
<style lang="scss" scoped>
.FlowComponent polygon {
  fill: var(--color);
  opacity: 1;
}

.FlowComponent .boundary {
  stroke: white;
  opacity: var(--flat-triangulation-hover, 0);
  stroke-width: 2px;
}
</style>
