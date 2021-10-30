<!--

  Draws a path on a surface interactively.

-->
<!--
 | Copyright (c) 2021 Julian Rüth <julian.rueth@fsfe.org>
 | 
 | Permission is hereby granted, free of charge, to any person obtaining a copy
 | of this software and associated documentation files (the "Software"), to deal
 | in the Software without restriction, including without limitation the rights
 | to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 | copies of the Software, and to permit persons to whom the Software is
 | furnished to do so, subject to the following conditions:
 | 
 | The above copyright notice and this permission notice shall be included in all
 | copies or substantial portions of the Software.
 | 
 | THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 | IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 | FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 | AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 | LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 | OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 | SOFTWARE.
 -->
<template>
  <g v-if="layout != null" @keydown.esc="edit(false)" tabindex="0">
    <g class="path">
      <g>
        <point-component v-for="(point, i) of controlPoints" :key="i" :svg="svg" :point="fromPathPoint(point)" :radius="3" />
      </g>
      <g>
        <segment-component v-for="(segment, i) of path" :key="i" :svg="svg" :segment="segment" />
      </g>
    </g>
    <g v-if="editable" @click="append()">
      <g class="preview">
        <point-component v-if="points.length !== 0" :point="fromPathPoint(cross(points[points.length - 1]))" :radius="5" :svg="svg" />
        <segment-component v-if="nextSegment != null" :svg="svg" :segment="nextSegment" />
      </g>
      <g class="select-half-edge">
        <g v-for="halfEdge of triangulation.halfEdges" :key="halfEdge" @mousemove="(e) => hover(halfEdge, e)" @mouseout="unhover" >
          <segment-component :svg="svg" :segment="layout.layout(halfEdge).segment" />
        </g>
      </g>
      <g class="select-vertex">
        <g v-for="(vertex, i) of vertices" :key="i" @mousemove="(e) => hover(vertex)" @mouseout="unhover">
          <point-component :point="layout.layout(vertex[0]).segment.start" :svg="svg" :radius="20"/>
        </g>
      </g>
      <g class="select-vertex">
        <g v-for="(point, i) of controlPoints" :key="i" @mousemove="(e) => hover(point)" @mouseout="unhover">
          <point-component :svg="svg" :point="fromPathPoint(point)" :radius="20" />
        </g>
      </g>
    </g>
  </g>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import noop from "lodash-es/noop";
import wait from "@/wait";

import PointComponent from "@/components/svg/Point.vue";
import SegmentComponent from "@/components/svg/Segment.vue";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import Layout from "@/layout/Layout";
import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import VisualizationOptions from "@/components/flatsurf/options/VisualizationOptions";
import Point from "@/geometry/Point";
import Segment from "@/geometry/Segment";
import HalfEdge, { isHalfEdge } from "@/flatsurf/HalfEdge";
import IPathInteraction, { PathPoint } from "@/components/interactions/IPathInteraction";


@Component({
  components: { PointComponent, SegmentComponent },
})
export default class PathInteraction extends Vue implements IPathInteraction {
  @Prop({required: true, type: Object}) svg!: CoordinateSystem;
  @Prop({ required: true, type: Object }) layout!: Layout;
  @Prop({ required: true, type: Object }) triangulation!: FlatTriangulation;
  @Prop({required: true, type: Object }) options!: VisualizationOptions;

  // The path constructed so far, given by the points on the path.
  public points: PathPoint[] = [];

  // The point to be added to the path.
  // For the purpose of previewing.
  next: PathPoint | null = null;

  editable: boolean = true;

  // Make path editable.
  edit(editable: boolean): void {
    this.editable = editable;
    this.next = null;
  }

  // Append a point to the path.
  append(): void {
    if (this.next !== null) {
      this.points.push(this.next);
      this.next = null;
    }
  }

  // Preview the effect of adding item to the path.
  hover(vertex: HalfEdge[]): void;
  hover(halfEdge: HalfEdge, e: MouseEvent): void;
  hover(face: HalfEdge[], e: MouseEvent): void;
  hover(point: PathPoint): void;
  hover(item: HalfEdge | HalfEdge[] | PathPoint, e?: MouseEvent): void {
    if (!this.editable)
      return;
    
    const next = this.toPathPoint(item, e);

    this.next = null;

    if (this.points.length === 0) {
      this.next = this.cross(next);
      return;
    }

    const previous = this.cross(this.points[this.points.length - 1]);
    const segment = this.toSegment(this.cross(previous), next);

    const sector = (vertex: HalfEdge[]) => [vertex[0], this.triangulation.vertices.image(vertex[vertex.length - 1])];

    // Determine intersections of this segment with all outer half edges.
    let intersections = this.triangulation.halfEdges
      .filter((halfEdge) => !this.layout!.layout(halfEdge).inner)
      .filter((halfEdge) => this.layout!.layout(halfEdge).segment.intersects(segment));

    // Ignore half edges that we intersect at the starting point.
    if ("halfEdge" in previous) {
      intersections = intersections.filter((halfEdge) => halfEdge !== previous.halfEdge); 
    } else if ("face" in previous) {
    } else {
      const boundary = [sector(previous.vertex)[0], -sector(previous.vertex)[1]]
      intersections = intersections.filter((halfEdge) => !boundary.includes(halfEdge));
    }

    // Ignore half edges that we intersect at the end point.
    if ("halfEdge" in next) {
      intersections = intersections.filter((halfEdge) => halfEdge !== next.halfEdge); 
    } else if ("face" in next) {
    } else {
      const boundary = [sector(next.vertex)[0], -sector(next.vertex)[1]]
      intersections = intersections.filter((halfEdge) => !boundary.includes(halfEdge));
    }

    if (intersections.length !== 0) {
      return;
    }

    if (segment.length < 1e-3) {
      return;
    }

    // Check that the segment is on the interior of the polygon.
    if ("halfEdge" in previous) {
      if (this.layout!.layout(previous.halfEdge).inner)
        noop();
      else if ("halfEdge" in next && next.halfEdge === previous.halfEdge)
        noop();
      else if ("vertex" in next && sector(next.vertex)[0] === previous.halfEdge)
        noop();
      else if ("vertex" in next && sector(next.vertex)[1] === -previous.halfEdge)
        noop();
      else {
        if (this.triangulation.vector(previous.halfEdge).angleTo(segment.tangentInStart) <= Math.PI) {
          return;
        }
      }
    } else if ("face" in previous) {
    } else {
      if (this.layout!.layout(previous.vertex[0]).inner)
        noop();
      else if ("halfEdge" in next && next.halfEdge === sector(previous.vertex)[0])
        noop();
      else if ("halfEdge" in next && next.halfEdge === -sector(previous.vertex)[1])
        noop();
      else if ("vertex" in next && sector(next.vertex)[0] == -sector(previous.vertex)[1])
        noop();
      else if ("vertex" in next && sector(next.vertex)[1] == -sector(previous.vertex)[0])
        noop();
      else {
        const boundary = sector(previous.vertex).map((halfEdge) => this.triangulation.vector(halfEdge));
        if (boundary[0].angleTo(boundary[1]) > boundary[0].angleTo(segment.tangentInStart)) {
          return;
        }
      }
    }

    this.next = next;
  }

  // Clear path preview created by hover().
  unhover(): void {
    this.next = null;
  }

  // Return the segment to be added to the path.
  get nextSegment(): Segment | null {
    if (this.points.length === 0)
      return null;
    if (this.next == null)
      return null;

    return this.toSegment(this.points[this.points.length - 1], this.next);
  }

  // Return the visible vertices, represented by their outgoing half edges.
  get vertices(): HalfEdge[][] {
    const vertices: HalfEdge[][] = [];

    const present = (source: HalfEdge) => vertices.filter((vertex) => vertex.includes(source)).length !== 0;
    const vertex = (source: HalfEdge) => {
      const vertex = [source];
      while (true) {
        const next = this.triangulation.vertices.image(vertex[vertex.length - 1]);
        if (!this.layout!.layout(next).inner)
          break;
        if (next === source)
          break;
        vertex.push(next);
      }
      return vertex;
    };

    for (const source of this.triangulation.halfEdges) {
      if (this.layout!.layout(source).inner)
        continue;
      if (present(source))
        continue;
      vertices.push(vertex(source));
    }

    for (const source of this.triangulation.halfEdges) {
      if (present(source))
        continue;
      vertices.push(vertex(source));
    }

    return vertices;
  }

  // Return the visible half edges.
  get halfEdges(): HalfEdge[] {
    // TODO: Drop duplicates. See https://github.com/flatsurf/vue-flatsurf/issues/37.
    return this.triangulation.halfEdges;
  }

  // Return the visible faces, represented by the half edges on their boundary.
  get faces(): HalfEdge[][] {
    return this.triangulation.faces.cycles;
  }

  // Return the line segments that make up this path.
  get path(): Segment[] {
    const path: Segment[] = [];

    let previous: PathPoint | null = null;

    for (let point of this.points) {
      if (previous != null)
        path.push(this.toSegment(previous, point));
      previous = point;
    }

    return path;
  }

  // Return the end points that make up this path.
  get controlPoints(): PathPoint[] {
    const controlPoints: PathPoint[] = [];

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      if (i === 0) {
        controlPoints.push(this.cross(point)); 
      } else if (i === this.points.length - 1) {
        controlPoints.push(point); 
      } else {
        controlPoints.push(point);
        if (this.cross(point) !== point)
        controlPoints.push(this.cross(point)); 
      }
    }

    return controlPoints;
  }

  // Return the segment connection two poinst on the path.
  toSegment(a: PathPoint, b: PathPoint) {
    return new Segment(this.fromPathPoint(this.cross(a)), this.fromPathPoint(b));
  }

  // Return the location of the mouse pointer in SVG coordinates.
  toPoint(e: MouseEvent): Point {
    let svg = this.$el;
    while (svg.tagName !== "svg")
      svg = svg.parentElement!;
    return new Point(this.svg, e.clientX - svg.getBoundingClientRect().left, e.clientY - svg.getBoundingClientRect().top);
  }

  // Return the location of the mouse pointer as a new point to append to the path.
  toPathPoint(item: HalfEdge | HalfEdge[] | PathPoint, e?: MouseEvent): PathPoint {
    if (isHalfEdge(item)) {
      const halfEdge = item as HalfEdge;
      const at = this.layout!.layout(halfEdge).segment.relativize(this.toPoint(e!));
      return {halfEdge, at};
    } else if ("halfEdge" in item || "vertex" in item || "face" in item) {
      return item;
    } else if (e === undefined) {
      const vertex = item as HalfEdge[];
      return { vertex };
    } else {
      const face = item as HalfEdge[];
      console.assert(face.length >= 2);

      const point = this.toPoint(e);
      const segments = [
        this.layout!.layout(face[0]).segment,
        this.layout!.layout(face[1]).segment,
      ];

      return { face, at: [
        segments[0].relativize(point),
        segments[1].relativize(point),
      ]};
    }
  }

  // Return a point on the path as a location in the SVG coordinate system.
  fromPathPoint(point: PathPoint): Point {
    if ("face" in point) {
      const boundary = point.face;
      const at = point.at;
      return this.layout!.layout(boundary[0]).segment.start
        .translate(this.layout!.layout(boundary[0]).segment.tangentInStart.multiply(at[0]))
        .translate(this.layout!.layout(boundary[1]).segment.tangentInStart.multiply(at[1]));
    } else if ("halfEdge" in point) {
      return this.layout!.layout(point.halfEdge).segment.at(point.at);
    } else {
      return this.layout!.layout(point.vertex[0]).segment.start;
    }
  }

  cross(point: PathPoint): PathPoint {
    if ("halfEdge" in point)
      return {
        halfEdge: -point.halfEdge,
        at: 1 - point.at,
      };
    else
      return point;
  }

  public async query(when: "now" | "completed" | "changed") {
    if (when === "completed") {
      while (this.editable === true)
        await wait(this, "editable");
    } else if (when === "changed") {
      if (this.editable === false)
        this.editable = true;
      await wait(this, ["editable", "path"]);
    }
    return this.points;
  }
}
</script>
<style lang="scss" scoped>
.select-vertex .point {
  fill: transparent;
  stroke: transparent;
  cursor: crosshair;
}

.select-half-edge .segment {
  stroke: transparent;
  stroke-width: 30px;
  cursor: crosshair;
}

.path .point {
  fill: #d95f02; 
}

.path .segment {
  stroke: #d95f02;
  stroke-width: 2px;
}

.preview .segment {
  stroke: rgba(#d95f02, .3);
  stroke-width: 3px;
}

.preview .point {
  fill: rgba(#d95f02, .3);
}
</style>
