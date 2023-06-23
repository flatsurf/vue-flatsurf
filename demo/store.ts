/* ******************************************************************************
 * Copyright (c) 2021 Julian Rüth <julian.rueth@fsfe.org>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * *****************************************************************************/

import type { StoreOptions } from "vuex";
import YAML from "yaml";

import FlatTriangulation from '@/flatsurf/FlatTriangulation';
import FlowComponent from '@/flatsurf/FlowComponent';
import Automorphism from '@/flatsurf/Automorphism';
import CoordinateSystem from '@/geometry/CoordinateSystem';
import Layout from "@/layout/Layout";
import Vertical from "@/flatsurf/Vertical";

const state = {
  raw: "",
  error: null as null | string,
  triangulation: null as null | FlatTriangulation,
  vertical: null as null | Vertical,
  flowComponents: null as null | FlowComponent[],
  automorphisms: null as null | Automorphism[],
  layout: null as null | Layout,
  coordinateSystem: CoordinateSystem.make(true, "Flatsurf Coordinate System"),
};

export type State = typeof state;

const store: StoreOptions<typeof state> = {
  state,
  actions: {
    reset: function({ commit, state }, payload: { raw: string }) {
      try {
        const parsed = YAML.parse(payload.raw);

        const triangulation = FlatTriangulation.parse(parsed.triangulation || parsed, state.coordinateSystem);
        const vertical = Vertical.parse(parsed.vertical || { x: 0, y: 1 }, state.coordinateSystem);
        const flowComponents = (parsed.components || []).map((component: any) => FlowComponent.parse(component, state.coordinateSystem));
        const automorphisms = (parsed.automorphisms || []).map((automorphism: any) => Automorphism.parse(automorphism));

        commit('reset', {
          raw: payload.raw,
          triangulation,
          vertical,
          flowComponents,
          automorphisms,
        });
      } catch (e: any) {
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
      vertical: Vertical,
      flowComponents: FlowComponent[],
      automorphisms: Automorphism[],
    }) {
      state.raw = payload.raw;
      state.triangulation = Object.freeze(payload.triangulation);
      state.vertical = Object.freeze(payload.vertical);
      state.flowComponents = Object.freeze(payload.flowComponents);
      state.automorphisms = Object.freeze(payload.automorphisms);
      state.layout = null;
      state.error = null;
    },

    error: function(state, payload: { message: string }) {
      state.error = payload.message;
    },
  },
};

export default store;
