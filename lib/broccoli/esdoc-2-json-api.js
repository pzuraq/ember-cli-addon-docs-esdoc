const path = require('path');

const Filter = require('broccoli-persistent-filter');

const Project = require('../models/project');
const Module = require('../models/module');
const { Class, Component } = require('../models/classes');
const { Function, Method, Helper } = require('../models/functions');
const { Variable, Field, Argument } = require('../models/variables');

const Serializer = require('../serializers/main');

function sortBy(attr) {
  return (a, b) => {
    if (a[attr] < b[attr]) {
      return -1;
    } else if (a[attr] > b[attr]) {
      return 1;
    }

    return 0;
  }
}

function normalizePaths(doc) {
  if (doc.kind === 'file') {
    doc.name = doc.name ? doc.name.substr(doc.name.indexOf('/')) : undefined;
  } else {
    doc.longname = doc.longname ? doc.longname.substr(doc.longname.indexOf('/')) : undefined;
    doc.memberof = doc.memberof ? doc.memberof.substr(doc.memberof.indexOf('/')) : undefined;
    doc.importPath = doc.importPath ? doc.importPath.substr(doc.importPath.indexOf('/')) : undefined;
  }
}

function isModule({ kind }) {
  return kind === 'file';
}

function isModuleDocument({ kind }) {
  return kind === 'class' || kind === 'function' || kind === 'variable';
}

function EmbeddedDocument({ kind }) {
  return kind === 'method' || kind === 'member';
}

class Esdoc2JsonApi extends Filter {
  constructor(inputTree, { parentAddon }) {
    super(...arguments);

    this.parentAddon = parentAddon;
  }

  processString(data) {
    let docs = JSON.parse(data);

    let modules = {};
    let klasses = {};

    for (let doc of docs) {
      normalizePaths(doc);

      if (isModule(doc)) {
        let module = new Module(doc);
        modules[module.id] = module;

      } else if (isModuleDocument(doc)) {
        let module = modules[doc.memberof];

        if (doc.export === false) continue;

        if (Component.detect(doc)) {
          let klass = new Component(doc);
          module.components.push(klass);
          klasses[klass.id] = klass;

        } else if (Class.detect(doc)) {
          let klass = new Class(doc)
          module.classes.push(klass);
          klasses[klass.id] = klass;

        } else if (Helper.detect(doc)) {
          module.functions.push(new Helper(doc));

        } else if (Function.detect(doc)) {
          module.functions.push(new Function(doc));

        } else if (Variable.detect(doc)) {
          module.variables.push(new Variable(doc));
        }

      } else if (EmbeddedDocument(doc)) {
        let klass = klasses[doc.memberof];

        if (Method.detect(doc)) {
          klass.methods.push(new Method(doc));

        } else if (Argument.detect(doc)) {
          klass.arguments.push(new Argument(doc));

        } else if (Field.detect(doc)) {
          klass.fields.push(new Field(doc));
        }
      }
    }

    // hoistPods(modules);
    // hoistDefaults(modules);

    let includedModules = Object.values(modules).sort(sortBy('path'));

    return JSON.stringify(Serializer.serialize('module', includedModules));
  }
}

module.exports = Esdoc2JsonApi;
