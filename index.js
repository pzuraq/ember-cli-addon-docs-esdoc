'use strict';

const ESDocCompiler = require('broccoli-esdoc');
const ESDoc2JsonApi = require('./lib/esdoc-2-json-api');

const ESDOC_PLUGINS = [
  {
    name: 'esdoc-ecmascript-proposal-plugin',
    option: {
      classProperties: true,
      objectRestSpread: true,
      doExpressions: true,
      functionBind: true,
      functionSent: true,
      asyncGenerators: true,
      decorators: true,
      exportExtensions: true,
      dynamicImport: true
    }
  },
  { name: 'esdoc-accessor-plugin' }
];

module.exports = {
  name: 'ember-cli-addon-docs-esdoc',

  createDocsGenerator(inputPaths, { project, destDir }) {
    let esdoc = new ESDocCompiler(inputPaths, {
      plugins: ESDOC_PLUGINS,
      dest: `./${destDir}`
    });

    return new ESDoc2JsonApi(esdoc, { project });
  }
};
