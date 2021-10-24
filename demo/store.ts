import type { StoreOptions } from "vuex";
import YAML from "yaml";

import FlatTriangulation from '@/flatsurf/FlatTriangulation';
import FlowComponent from '@/flatsurf/FlowComponent';
import Automorphism from '@/flatsurf/Automorphism';
import CoordinateSystem from '@/geometry/CoordinateSystem';
import Layout from "@/layout/Layout";

const state = {
  raw: "",
  error: null as null | string,
  triangulation: null as null | FlatTriangulation,
  flowComponents: null as null | FlowComponent[],
  automorphisms: null as null | Automorphism[],
  layout: null as null | Layout,
  coordinateSystem: new CoordinateSystem(true),
};

const store: StoreOptions<typeof state> = {
  state,
  actions: {
    reset: function({ commit, state }, payload: { raw: string }) {
      try {
        const parsed = YAML.parse(payload.raw);

        // TODO: Rotate SVG coordinate system instead.
        // const vertical = parsed.vertical || {x: 0, y: 1};
        // const angle = new Vector(state.coordinateSystem, 0, 1).angleTo(new Vector(state.coordinateSystem, vertical.x, vertical.y));
        // const rotatedCoordinateSystem = new CoordinateSystem(true);
        // rotatedCoordinateSystem.embedInto(state.coordinateSystem, new Flatten.Matrix().rotate(angle));

        const triangulation = FlatTriangulation.parse(parsed, state.coordinateSystem);
        const flowComponents = (parsed.components || []).map((component: any) => FlowComponent.parse(component, state.coordinateSystem));
        const automorphisms = (parsed.automorphisms || []).map((automorphism: any) => Automorphism.parse(automorphism));

        commit('reset', {
          raw: payload.raw,
          triangulation,
          flowComponents,
          automorphisms,
        });
      } catch (e) {
        commit('error', {message: e.message});
      }
    },
  },
  mutations: {
    layout: function(state, payload: {
      layout: Layout
    }) {
      state.layout = payload.layout;
    },

    reset: function(state, payload: {
      raw: string,
      triangulation: FlatTriangulation,
      flowComponents: FlowComponent[],
      automorphisms: Automorphism[],
    }) {
      state.raw = payload.raw;
      state.triangulation = payload.triangulation;
      // TODO: Should be empty array if unset.
      state.flowComponents = payload.flowComponents;
      state.automorphisms = payload.automorphisms;
      state.layout = null;
      state.error = null;
    },

    error: function(state, payload: { message: string }) {
      state.error = payload.message;
    },
  },
};

export default store;
