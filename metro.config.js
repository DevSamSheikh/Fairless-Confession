const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = path.resolve(__dirname);

const config = getDefaultConfig(projectRoot);

// Pin Metro to this project only (avoids D:\ + C:\ path mix on Windows with global Expo).
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

module.exports = config;
