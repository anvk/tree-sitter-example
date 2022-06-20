const path = require('path');

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'bin'),
        filename: 'app.bundle.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: './index.html',
            template: path.resolve(configDirs.APP_DIR_TEMPLATES, './index.prod.html'),
            inject: true,
            publicPath: path.join(configDirs.PUBLIC_PATH, 'public'),
        }),
        new HtmlWebpackInjector(),
    ],
};
