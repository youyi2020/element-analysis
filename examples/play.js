import Vue from 'vue'
import Play from './play/index'
import TGBase from 'main/index.js';

Vue.config.productionTip = false;
Vue.use(TGBase);

new Vue({
    el:"#app",
    template:'<Play/>',
    components:{Play}
});