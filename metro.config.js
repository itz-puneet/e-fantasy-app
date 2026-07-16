// ============================================================================
//  metro.config.js
//  Metro is the tool that bundles your app's code. This is the default Expo
//  config, plus one small fix:
//
//  Some libraries try to OPTIONALLY load "@opentelemetry/api" (telemetry) with
//  a guarded import that safely does nothing if it's missing. Metro, however,
//  still tries to resolve it and fails on Web. We don't use telemetry, so we
//  point that import at an empty module. This makes Web bundling work.
// ============================================================================
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@opentelemetry/api') {
    return { type: 'empty' };
  }
  const resolver = originalResolveRequest ?? context.resolveRequest;
  return resolver(context, moduleName, platform);
};

module.exports = config;
