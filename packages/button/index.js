import TgButton from './src/main.vue';

/* istanbul ignore next */
TgButton.install = function(Vue) {
    Vue.component(TgButton.name, TgButton);
};

export default TgButton;
