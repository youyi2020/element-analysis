const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const md = require('markdown-it')();
const slugify = require('transliteration').slugify;
const striptags = require('./strip-tags');

const config = require('./config');
const isProd = process.env.NODE_ENV === 'production';
const isPlay = !!process.env.PLAY_ENV;

// 由于cheerio在转换汉字时会出现转为Unicode的情况,所以我们编写convert方法来保证最终转码正确
function convert(str) {
    str = str.replace(/(&#x)(\w{4});/gi, function($0) {
        return String.fromCharCode(parseInt(encodeURIComponent($0).replace(/(%26%23x)(\w{4})(%3B)/g, '$2'), 16));
    });
    return str;
}

// 由于v-pre会导致在加载时直接按内容生成页面.但是我们想要的是直接展示组件效果,通过正则进行替换
function wrap(render) {
    return function() {
        return render.apply(this, arguments)
            .replace('<code v-pre class="', '<code class="hljs ')
            .replace('<code>', '<code class="hljs">');
    };
}

const webpackConfig = {
    mode: process.env.NODE_ENV,
    entry: isProd ? {
        docs: './examples/entry.js',
        'tg-base': './src/index.js'
    } : (isPlay ? './examples/play.js' : './examples/entry.js'),
    output: {
        path: path.resolve(process.cwd(), './examples/dist/'),
        publicPath: '',
        filename: '[name].[hash:7].js',
        chunkFilename: isProd ? '[name].[hash:7].js' : '[name].js'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: config.alias,
        modules: ['node_modules']
    },
    devServer: {
        host: '0.0.0.0',
        port: 8085,
        publicPath: '/',
        noInfo: true
    },
    performance: {
        hints: false
    },
    stats: {
        children: false
    },
    module: {
        rules: [
            {
                test: /\.(jsx?|babel|es6)$/,
                include: process.cwd(),
                exclude: config.jsexclude,
                loader: 'babel-loader'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: {
                        preserveWhitespace: false
                    }
                }
            },
            {
                test: /\.md$/,
                loaders: [
                    {
                        loader: 'vue-loader'
                    },
                    {
                        loader: 'vue-markdown-loader/lib/markdown-compiler',
                        options: {
                            preventExtract: true,
                            raw: true,
                            preprocess: function(MarkdownIt, source) {
                                MarkdownIt.renderer.rules.table_open = function() {
                                    return '<table class="table">';
                                };
                                MarkdownIt.renderer.rules.fence = wrap(MarkdownIt.renderer.rules.fence);
                                return source;
                            },
                            use: [
                                [require('markdown-it-anchor'), {
                                    level: 2, // 添加超链接锚点的最小标题级别, 如: #标题 不会添加锚点
                                    slugify: slugify, // 自定义slugify, 我们使用的是将中文转为汉语拼音,最终生成为标题id属性
                                    permalink: true, // 开启标题锚点功能
                                    permalinkBefore: true // 在标题前创建锚点
                                }],
                                [require('markdown-it-container'), 'demo', { // 当我们写::: demo :::这样的语法时才会进入自定义渲染方法
                                    validate: function(params) {
                                        return params.trim().match(/^demo\s*(.*)$/);
                                    },

                                    render: function(tokens, idx) { // 自定义渲染方法,这里为核心代码
                                        var m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
                                        if (tokens[idx].nesting === 1) { // nesting === 1表示标签开始
                                            var description = (m && m.length > 1) ? m[1] : ''; // 获取正则捕获组中的描述内容,即::: demo xxx中的xxx
                                            var content = tokens[idx + 1].content; // 获得内容
                                            var html = convert(striptags.strip(content, ['script', 'style'])).replace(/(<[^>]*)=""(?=.*>)/g, '$1'); // 解析过滤解码生成html字符串
                                            var script = striptags.fetch(content, 'script'); // 获取script中的内容
                                            var style = striptags.fetch(content, 'style'); // 获取style中的内容
                                            var jsfiddle = { html: html, script: script, style: style }; // 组合成prop参数,准备传入组件
                                            var descriptionHTML = description // 是否有描述需要渲染
                                                ? md.render(description)
                                                : '';

                                            jsfiddle = md.utils.escapeHtml(JSON.stringify(jsfiddle)); // 将jsfiddle对象转换为字符串,并将特殊字符转为转义序列
                                            // 起始标签,写入demo-block模板开头,并传入参数
                                            return `<demo-block class="demo-box" :jsfiddle="${jsfiddle}">
                                <div class="source" slot="source">${html}</div>
                                ${descriptionHTML}
                                <div class="highlight" slot="highlight">`;
                                        }
                                        return '</div></demo-block>\n'; // 否则闭合标签
                                    }
                                }],
                                [require('markdown-it-container'), 'tip'],
                                [require('markdown-it-container'), 'warning']
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                loaders: [
                    isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)$/,
                loader: 'url-loader',
            },
            {
                test: /\.scss$/,
                loaders: [
                    isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: path.posix.join('static', '[name].[hash:7].[ext]')
                }
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './examples/index.tpl',
            filename: './index.html',
            favicon: './examples/favicon.ico'
        }),
        new ProgressBarPlugin(),
        new VueLoaderPlugin(),
        new webpack.LoaderOptionsPlugin({
            vue: {
                compilerOptions: {
                    preserveWhitespace: false
                }
            }
        })
    ]
};

if (isProd) {
    webpackConfig.plugins.push(
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:7].css'
        })
    );
}


module.exports = webpackConfig;