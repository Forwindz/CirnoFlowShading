module.exports = {
    configureWebpack: config => {
      return {
        module: {
            rules: [{ test: /\.(fbx|jpeg|png|obj|mtl|max)$/, use: 'file-loader' }],
          }
      }
    }
  }