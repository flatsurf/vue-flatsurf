import Vue, { VNode } from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify/lib';
import VueRouter from 'vue-router'
import Vuex from 'vuex';
import AsyncComputed from "vue-async-computed";
import '@mdi/font/css/materialdesignicons.css'

import routes from "./routes";
import store from "./store";

import raw from "!!raw-loader!./2-3-4.txt";

Vue.config.productionTip = false;

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(AsyncComputed);

new Vue({
    render: (h): VNode => h(App),
    vuetify: new Vuetify({}),
    router: new VueRouter({ routes }),
    store: new Vuex.Store(store),
    created() {
      this.$store.dispatch("reset", { raw });
    }
}).$mount('#app');
