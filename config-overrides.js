const webpack = require('webpack');

module.exports = {
  webpack: function(config, env) {
    return config;
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      
      // Fix for allowedHosts issue - use 'all' instead of array
      config.allowedHosts = 'all';
      
      return config;
    };
  }
};
