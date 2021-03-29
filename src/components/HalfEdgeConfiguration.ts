import Segment from "@/geometry/Segment";

export interface IHalfEdgeConfiguration {
  interactions: {
    click: (ev: MouseEvent, segment: Segment) => void,
    enter: (ev: MouseEvent, segment: Segment) => void,
    leave: (ev: MouseEvent, segment: Segment) => void,
    hover: (ev: MouseEvent, segment: Segment) => void,
  },
  state: {
    selected: boolean,
    glued: boolean,
    labeled: boolean,
    indicator: number | null,
  },
};

export const DefaultHalfEdgeConfiguration: IHalfEdgeConfiguration = {
  interactions: {
    click: () => {},
    enter: () => {},
    leave: () => {},
    hover: () => {},
  },
  state: {
    selected: false,
    glued: false,
    labeled: false,
    indicator: null,
  }
};
