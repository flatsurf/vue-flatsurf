import HalfEdge from "@/flatsurf/HalfEdge";
import IHalfEdgeOptions from "./IHalfEdgeOptions";

export default interface IFlatTriangulationOptions {
  get(halfEdge: HalfEdge): IHalfEdgeOptions;
};
