// Babel is what turns your modern JavaScript/TypeScript into code the phone
// can run. "babel-preset-expo" already includes everything Expo Router needs.
//
// The one addition is 'react-native-worklets/plugin' — this is what powers
// Reanimated 4 (our animation library). It rewrites the little animation
// functions so they can run on the phone's UI thread for buttery-smooth motion.
// IMPORTANT: it MUST stay LAST in the plugins array.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
