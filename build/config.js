var path = require('path');
var nodeExternals = require('webpack-node-externals');
var externals = {};
exports.alias = {
    main: path.resolve(__dirname, '../src'),
    packages: path.resolve(__dirname, '../packages'),
    examples: path.resolve(__dirname, '../examples'),
    'element-ui': path.resolve(__dirname, '../'),
    vue: 'vue/dist/vue.js'
};

externals = [Object.assign({
    vue: 'vue'
}, externals), nodeExternals()];

exports.externals = externals;

exports.jsexclude = /node_modules|utils\/popper\.js|utils\/date.\js/;