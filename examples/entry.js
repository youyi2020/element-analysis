import Vue from 'vue'
import App from './app'
import TGBase from 'main/index.js';
import VueRouter from 'vue-router';
import routes from './route.config';
import demoBlock from './components/demo-block';

Vue.config.productionTip = false;
Vue.use(TGBase);
Vue.use(VueRouter);
Vue.component('demo-block', demoBlock);

const router = new VueRouter({
    mode: 'hash',
    base: __dirname,
    routes
});

new Vue({
    el:"#app",
    router,
    template:'<App/>',
    components:{App}
});