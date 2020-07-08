import Vue, { VNode } from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify/lib';
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false;

Vue.use(Vuetify);

new Vue({
    render: (h): VNode => h(App),
    vuetify: new Vuetify({}),
}).$mount('#app');
