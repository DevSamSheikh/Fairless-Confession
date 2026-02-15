const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Always use full absolute path (never just "D:" on Windows) to avoid D:\ + C:\ path mix.
const projectRoot = path.resolve(__dirname);
if (projectRoot.length <= 3 && /^[A-Za-z]:\\?$/.test(projectRoot)) {
  throw new Error('metro.config.js: projectRoot resolved to drive only. __dirname=' + __dirname);
}

const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

module.exports = config;
