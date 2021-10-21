import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import FlowComponent from "@/flatsurf/FlowComponent";
import Automorphism from "@/flatsurf/Automorphism";
import CoordinateSystem from "@/geometry/CoordinateSystem";

export default interface ISurface {
  triangulation: FlatTriangulation;
  components: FlowComponent[];
  automorphisms: Automorphism[];

  coordinateSystem: CoordinateSystem;
};
