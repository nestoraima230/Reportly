// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Add asset extensions if needed
defaultConfig.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

// Add source extensions
defaultConfig.resolver.sourceExts.push('cjs');

// Disable package exports for compatibility
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;