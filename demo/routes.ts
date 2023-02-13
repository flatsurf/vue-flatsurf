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

import type { RouteRecordRaw, RouteLocation } from "vue-router";

import Viewer from './Viewer.vue';
import ViewerMenu from './ViewerMenu.vue';
import Editor from './Editor.vue';
import EditorMenu from './EditorMenu.vue';
import Export from './Export.vue';
import Widget from './Widget.vue';

import castArray from "lodash-es/castArray";

function viewerProps(route: RouteLocation) {
  const props = {
    action: route.query.action || "glue",
    show: castArray(route.query.show || ["outer", "outer-labels", "triangulation"]),
  };
  return props;
}

function exportProps(route: RouteLocation) {
  return {
    action: "view",
    show: castArray(route.query.show || ["outer", "outer-labels"]),
  };
}

const routes = [
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
  { path: '/widget', components: {
      default: Widget,
    },
  },
  { path: '/pathMatch(.*)', redirect: '/view' },
] as RouteRecordRaw[]

export default routes;