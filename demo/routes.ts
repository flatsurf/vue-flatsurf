import type { Route } from "vue-router";

import Viewer from './Viewer.vue';
import ViewerMenu from './ViewerMenu.vue';
import Editor from './Editor.vue';
import EditorMenu from './EditorMenu.vue';

const routes = [
  { path: '/', redirect: '/view' },
  { path: '/view', components: {
      default: Viewer,
      menu: ViewerMenu,
    },
    props: {
      default: (route: Route) => ({...route.query}),
      menu: (route: Route) => ({...route.query}),
    },
  },
  { path: '/edit', components: {
    default: Editor,
    menu: EditorMenu,
  }},
  { path: '*', redirect: '/view' },
  // TODO: svg
]

export default routes;
