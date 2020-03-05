// The COMMIT_REF is exposed by Netlify at buid time and is the git SHA.
// https://docs.netlify.com/configure-builds/environment-variables/#git-metadata
// To use it in code, we need to pass it in as a VUE_APP variable.
process.env.VUE_APP_VERSION = process.env.COMMIT_REF;

module.exports = {
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule.use('vue-svg-loader').loader('vue-svg-loader');
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/sw.js',
      swDest: 'service-worker.js',
    },
  },
};
