const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(
      (ext) => ext !== 'svg' && ext !== 'png'
    ),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  config.resolver.assetExts = [...config.resolver.assetExts, 'png'];

  return config;
})();
