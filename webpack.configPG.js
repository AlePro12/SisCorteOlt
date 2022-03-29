module.exports = {
    entry: './src/appPG/index.js',
    output: {
        path: __dirname + '/src/PuntaGorda/js',
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            use: 'babel-loader',
            test: /\.js$/,
            exclude: /node_modules/
        }]
    },
    node: {
        fs: 'empty',
        global: true,
        crypto: 'empty',
        process: false,
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};