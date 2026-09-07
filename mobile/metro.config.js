const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// Shared business rules live beside the mobile app, inside the one repository.
config.watchFolders = [path.resolve(__dirname, '..')];
config.resolver.nodeModulesPaths = [path.resolve(__dirname,'node_modules'),path.resolve(__dirname,'../node_modules')];
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const existingBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList) ? existingBlockList : existingBlockList ? [existingBlockList] : []),
  new RegExp(escapeRegExp(path.resolve(__dirname, '../backups')) + '/.*'),
  new RegExp(escapeRegExp(path.resolve(__dirname, '../.next')) + '/.*'),
];
module.exports = config;
