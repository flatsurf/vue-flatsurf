**Added:**

* Added `PathInteraction` and `GlueInteraction` to fill a slot in the
  `Viewer.vue`. This allows any interaction with the surface to pulled out into
  a separate component.

* Added `Edge.vue` so we do not need special handling when pairs of `HalfEdge` are in the same location.

* When visually gluing half edges, the glued half edge is now kept in place
  visually which should make it easier to understand how the gluing was
  performed.

* Added `Layouter` component to optionally take care of layouting.

* Added `Widget` component which encapsulates all the features that are exposed by ipyvue-flatsurf.

**Changed:**

* Renamed `SurfaceViewer.vue` to `Viewer.vue`.

* Moved `HalfEdge.vue`, `FlatTriangulation.vue`, `Face.vue`, `FlowComponent.vue`, `SaddleConnection.vue` to `components/flatsurf`.

* Renamed `focus` of `PanZoom.vue` to `value` to make it `v-model` bindable.

* Moved aspects of visualization such as indicators to `VisualizationOptions`.

* Moved aspects of layouting to `LayoutOptions`.

* Renamed `FlatTriangulationLayout` to `Layout`.

**Removed:**

* Removed `ExtendedClickArea.vue`. Instead interactions should be explicit about event handling now.

* Removed unused `IParsed` interface.

**Fixed:**

* The focused area of `PanZoom.vue` is now two-way bindable with `v-model`.

* The SVG output now resizes when its container resizes.

* Coordinate systems can now have more than one embedding established with `embedInto()`.
