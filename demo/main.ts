import YAML from "yaml";

import Vue, { VNode } from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify/lib';
import VueRouter from 'vue-router'
import Vuex from 'vuex';
import '@mdi/font/css/materialdesignicons.css'

import Viewer from './Viewer.vue';
import ViewerMenu from './ViewerMenu.vue';
import Editor from './Editor.vue';
import EditorMenu from './EditorMenu.vue';

import raw from "!!raw-loader!./2-3-4.txt";
import FlatTriangulation from '@/flatsurf/FlatTriangulation';
import FlowComponent from '@/flatsurf/FlowComponent';
import Automorphism from '@/flatsurf/Automorphism';
import CoordinateSystem from '@/geometry/CoordinateSystem';
import Vector from "@/geometry/Vector";
import Flatten from "@flatten-js/core";

Vue.config.productionTip = false;

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(Vuex);

new Vue({
    render: (h): VNode => h(App),
    vuetify: new Vuetify({}),
    // TODO: Move to separate file.
    router: new VueRouter({
      routes: [
        { path: '/', redirect: '/view' },
        { path: '/view', components: {
            default: Viewer,
            menu: ViewerMenu,
          },
          props: {
            menu: route => ({...route.query}),
          },
        },
        { path: '/edit', components: {
          default: Editor,
          menu: EditorMenu,
        }},
        { path: '*', redirect: '/view' },
        // TODO: svg
      ],
    }),
    // TODO: Move to separate file.
    store: new Vuex.Store({
      state: {
        raw: "",
        error: null as null | string,
        triangulation: null as null | FlatTriangulation,
        flowComponents: null as null | FlowComponent[],
        automorphisms: null as null | Automorphism[],
        coordinateSystem: new CoordinateSystem(true),
      },
      actions: {
        reset: function({ commit, state }, payload: { raw: string }) {
          try {
            const parsed = YAML.parse(payload.raw);

            const vertical = parsed.vertical || {x: 0, y: 1};
            const angle = new Vector(state.coordinateSystem, 0, 1).angleTo(new Vector(state.coordinateSystem, vertical.x, vertical.y));

            const rotatedCoordinateSystem = new CoordinateSystem(true);
            rotatedCoordinateSystem.embedInto(state.coordinateSystem, new Flatten.Matrix().rotate(angle));

            const triangulation = FlatTriangulation.parse(parsed, rotatedCoordinateSystem);
            const flowComponents = (parsed.components || []).map((component: any) => FlowComponent.parse(component, rotatedCoordinateSystem));
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
        reset: function(state, payload: {
          raw: string,
          triangulation: FlatTriangulation,
          flowComponents: FlowComponent[],
          automorphisms: Automorphism[],
        }) {
          state.raw = payload.raw;
          state.triangulation = payload.triangulation;
          state.flowComponents = payload.flowComponents;
          state.automorphisms = payload.automorphisms;
          state.error = null;
        },
        error: function(state, payload: { message: string }) {
          state.error = payload.message;
        },
      },
    }),
    created() {
      this.$store.dispatch("reset", { raw });
    }
}).$mount('#app');
