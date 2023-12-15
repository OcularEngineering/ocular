const { composePlugins, withNx } = require('@nx/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
      // Set mode to development
      return merge(config,{
        mode: 'development',
        optimization: {
          minimize: false
        }
      })
  }
);
