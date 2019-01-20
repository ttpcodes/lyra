const CopyWebpackPlugin = require('copy-webpack-plugin')
const { resolve } = require('path')

module.exports = {
    entry: {
      appJs: './public/js/index.js'
    },
    output: {
        filename: 'js/index.js',
        path: resolve(__dirname, 'dist')
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './public/css', to: 'static/css' },
            { from: './public/img', to: 'static/img' },
            { from: './public/js', to: 'static/js' },
            { from: './public/views', to: '.' },
            { from: './public/particles.json', to: 'static/.' },
            { from: './public/Thread.m4a', to: 'static/.' }
        ])
    ]
}
