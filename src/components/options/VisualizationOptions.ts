// TODO: Split file.

export interface IVisualizationOptions {
  halfEdges: {
    [halfEdge: number]: IHalfEdgeVisualizationOptions,
  },
};

export interface IHalfEdgeVisualizationOptions {
  selected: boolean,
  glued: boolean,
  label: string | null,
  indicator: number | null,
};

export const DefaultVisualizationOptions: IVisualizationOptions = {
  halfEdges: {},
};

export const DefaultHalfEdgeVisualizationOptions: IHalfEdgeVisualizationOptions ={
  selected: false,
  glued: false,
  label: null,
  indicator: null,
};
