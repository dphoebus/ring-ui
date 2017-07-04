require('babel-polyfill');

const path = require('path');

const webpack = require('webpack');
const {DllBundlesPlugin} = require('webpack-dll-bundles-plugin');
const KotlinWebpackPlugin = require('kotlin-webpack-plugin');
const webpackConfig = require('ring-ui/webpack.config');
const pkgConfig = require('ring-ui/package.json').config;
const kotlinConf = require('ring-ui/kotlin.conf');

const docpackSetup = require('./webpack-docs-plugin.setup');
const createEntriesList = require('./create-entries-list');

// Borrowed from webpack-dev-server
const colorInfo = msg => `\u001b[1m\u001b[34m${msg}\u001b[39m\u001b[22m`;

const ringUiPath = path.dirname(require.resolve('ring-ui'));
const publicPath = '/';
const distDir = 'dist';
const contentBase = path.resolve(__dirname, distDir);
const kotlinDist = path.join(contentBase, 'kotlin');
const siteComponents = path.resolve(__dirname, 'components');

// For docs-app entry point
webpackConfig.componentsPath.push(siteComponents);

module.exports = (env = {}) => {
  const {server, production} = env;
  const envString = production ? 'production' : 'development';
  const devtool = production ? 'source-map' : 'eval';

  const getParam = name => (
    env[name] ||
    process.env[`npm_package_config_${name}`] ||
    process.env[`npm_package_config_${envString}_${name}`] ||
    pkgConfig[name] ||
    pkgConfig[envString][name]
  );

  const port = Number(getParam('port'));
  const host = getParam('host');
  const serverUri = getParam('hub');
  const clientId = getParam('clientId');

  console.log(`Hub server used is ${colorInfo(serverUri)}`);
  const hubConfig = JSON.stringify({serverUri, clientId});

  const docsWebpackConfig = {
    entry: {
      components: createEntriesList(path.join(ringUiPath, 'components/*')),
      'docs-app': siteComponents,
      'example-common': path.join(siteComponents, 'example-common'),
      favicon: 'file-loader?name=favicon.ico!jetbrains-logos/hub/favicon.ico'
    },
    resolve: {
      mainFields: ['module', 'browser', 'main'],
      modules: [kotlinDist, path.resolve(ringUiPath, 'node_modules')],
      // needed in examples
      alias: {
        'ring-ui': ringUiPath
      }
    },
    context: ringUiPath,
    module: {
      rules: [
        ...webpackConfig.config.module.rules,
        // HTML examples
        {
          test: /example\.html$/,
          use: [
            'file-loader?name=examples/[name]/[hash].html',
            'extract-loader',
            webpackConfig.loaders.htmlLoader.loader
          ]
        },

        // Kotlin examples
        {
          test: /example\.kt/,
          loader: path.resolve(__dirname, 'kotlin-example-loader')
        }
      ]
    },
    devtool,
    devServer: {
      host,
      port,
      contentBase,
      stats: {
        assets: false,
        chunks: false,
        hash: false,
        children: 'error',
        version: false
      }
    },
    output: {
      path: contentBase,
      pathinfo: server,
      filename: '[name].js',
      publicPath // serve HMR update jsons properly
    },
    plugins: [
      new KotlinWebpackPlugin(Object.assign(kotlinConf, {
        output: kotlinDist,
        sourceMaps: true,
        metaInfo: true
      })),
      new webpack.DefinePlugin({hubConfig}),
      docpackSetup(),
      new DllBundlesPlugin({
        bundles: {
          vendor: [
            'babel-polyfill',
            'core-js',
            'dom4',
            'whatwg-fetch',
            'react',
            'react-dom',
            '@hypnosphi/react-portal',
            'react-waypoint',
            'angular',
            'classnames',
            'combokeys',
            'moment',
            'simply-uuid'
          ]
        },
        dllDir: contentBase,
        webpackConfig: {
          devtool,
          module: {
            rules: [
              webpackConfig.loaders.whatwgLoader
            ]
          },
          plugins: [] // DllBundlesPlugin will set the DllPlugin here
        }
      })
    ]
  };

  // if (server) {
  //   docsWebpackConfig.plugins.push(
  //     new webpack.HotModuleReplacementPlugin(),
  //   );
  // }

  return docsWebpackConfig;
};