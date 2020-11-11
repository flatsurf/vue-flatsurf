# Viewports & Coordinate Systems

The idea of the classes in this file is to support conversions between all the
coordinate systems in the following scenario:

* The client is shown an SVG image in a rectangular box, the viewport; this
  defines the client coordinate system which starts at (0, 0) in the upper left
  corner of that box. If w and h are the width and height of that rectangular
  box as stated by the browser, the coordinate (w, h) is the lower-right corner
  of that box.
* The SVG image that is displayed to the client has its own coordinate system.
  This coordinate system is, like the client coordinate system, in non-standard
  orientation, i.e., y coordinates grow by going down.
* One or more ideal coordinate systems which can be in standard or non-standard
  orientation.

Please consult the tests to see examples of typical ways to make these
coordinate systems interact.
