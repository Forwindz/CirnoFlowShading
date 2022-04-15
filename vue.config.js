module.exports = {
    configureWebpack: config => {
      return {
        module: {
            rules: [{ test: /\.(fbx|jpeg|png|obj|mtl|max|glb)$/, use: 'file-loader' }],
          }
      }
    },
    publicPath: process.env.NODE_ENV === "production" ? "/DemoPresent/" : "/",
  }