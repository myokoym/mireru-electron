const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    entry: './src/renderer/index.tsx',
    mode: argv.mode || 'development',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, 'tsconfig.renderer.json'),
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist/renderer'),
      clean: true,
      publicPath: isDevelopment ? '/' : './',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/renderer/index.ejs',
        filename: 'index.html',
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist/renderer'),
      },
      port: 1212,
      hot: true,
      historyApiFallback: true,
    },
    target: 'electron-renderer',
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  };
};