**Fixed:**

* Do not show "inner structure" of minimal components.
  Usually, when libflatsurf produces a minimal component, it is already very
  stretched out in flow direction due to all the steps of Rauzy induction that
  happened. This internal structure has no meaning and should not be shown to
  the user. We are only interested in the boundaries of the minimal component
  here.
