const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
        '~': path.resolve(__dirname, './')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, 'node_modules/@ethersproject'),
            path.resolve(__dirname, 'node_modules/@scure'),
            path.resolve(__dirname, 'node_modules/bip39'),
            path.resolve(__dirname, 'node_modules/web3')
          ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  },
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    https: false,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    }
  }
}
