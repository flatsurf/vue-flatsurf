import type { Route } from "vue-router";

import Viewer from './Viewer.vue';
import ViewerMenu from './ViewerMenu.vue';
import Editor from './Editor.vue';
import EditorMenu from './EditorMenu.vue';
import Export from './Export.vue';

import castArray from "lodash-es/castArray";

function viewerProps(route: Route) {
  return {
    action: route.query.action || "glue",
    show: castArray(route.query.show || ["outer", "outer-labels"]),
  };
}

function exportProps(route: Route) {
  return {
    action: "view",
    show: castArray(route.query.show || ["outer", "outer-labels"]),
  };
}

const routes = [
  { path: '/', redirect: '/view' },
  { path: '/view', components: {
      default: Viewer,
      menu: ViewerMenu,
    },
    props: {
      default: viewerProps,
      menu: viewerProps,
    },
  },
  { path: '/edit', components: {
    default: Editor,
    menu: EditorMenu,
  }},
  { path: '/svg', components: {
      default: Export,
    },
    props: {
      default: exportProps,
    },
  },
  { path: '*', redirect: '/view' },
]

export default routes;
