import FlatTriangulation from "@/flatsurf/FlatTriangulation";
import FlowComponent from "@/flatsurf/FlowComponent";
import Automorphism from "@/flatsurf/Automorphism";
import CoordinateSystem from "@/geometry/CoordinateSystem";

// TODO: Is there a better name for this?
export default interface IParsed {
  surface: FlatTriangulation;
  components: FlowComponent[];
  automorphisms: Automorphism[];

  coordinateSystem: CoordinateSystem;
};
