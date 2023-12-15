const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config) => {
    config.mode = 'development';
    // Disable minification
    config.optimization.minimize = false;
    config.optimization.minimizer = [];

    // Set development mode and inline source maps

    config.devtool = 'inline-source-map';

    // Configure the development server
    config.devServer = {
      static: './dist',
    };

    // Specify entry point
    config.entry = {
      main: './src/main.js',
      index: './src/main.js',
    };

   



    return config;
  }
);
