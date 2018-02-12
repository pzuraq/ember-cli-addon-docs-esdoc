'use strict';

const ESDocCompiler = require('broccoli-esdoc');
const Funnel = require('broccoli-funnel');

const ESDoc2JsonApi = require('./lib/broccoli/esdoc-2-json-api');

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

  createDocsGenerator(inputPaths, { parentAddon, destDir }) {
    let esdoc = new ESDocCompiler(inputPaths, {
      plugins: ESDOC_PLUGINS,
      source: './',
      dest: `./${destDir}`
    });

    let esdocWithoutAst = new Funnel(esdoc, {
      exclude: ['docs/ast']
    })

    return new ESDoc2JsonApi(esdocWithoutAst, { parentAddon });
  }
};
