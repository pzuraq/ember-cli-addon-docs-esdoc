const fs = require('fs');
const path = require('path');

const Filter = require('broccoli-persistent-filter');

const Project = require('../models/project');
const Module = require('../models/module');
const { Class, Component } = require('../models/classes');
const { Function, Method, Helper } = require('../models/functions');
const { Variable, Field, Argument } = require('../models/variables');

/**
 * Determine if the path is a pod that should be hoisted. Some pods may have
 * multiple types of JS files (like routes or controllers) so we don't want to
 * hoist them, but components are fully self contained pods with just one JS
 * file so it makes sense to hoist them.
 *
 * @param {string} path the path to be checked
 */
function isPodPath(path) {
  return path === 'component';
}

/**
 * "Hoist" pod modules so they don't appear in a super nested way, e.g.
 *
 * /components
 *   /foo-bar
 *     component.js <- This is a pod, colocated js, template, and styles
 *     template.hbs
 *     styles.scss
 *
 * Would normally become
 *
 * /components/foo-bar/component
 *   {{foo-bar}}
 *
 * In the nav bar, because it's module is the file that exports it. In
 * the case of certain types of pods, however, we can be sure that there
 * is only one JS file which is essentially the code for the entire pod.
 * In this case, it makes sense to remove the last module level for
 * navigation purposes:
 *
 * /components/foo-bar
 *   {{foo-bar}}
 *
 * We then do one more level of hoisting (see hoistDefaults) to clean
 * up the navigation even more.
 *
 * @param {Object} modules
 */
function hoistPods(modules) {
  let moduleMap = {};

  for (let m in modules) {
    let module = modules[m];

    let parentModulePath = path.dirname(module.attributes.path);

    if (isPodPath(path.basename(module.attributes.path))) {
      moduleMap[parentModulePath] = moduleMap[parentModulePath] || [];
      moduleMap[parentModulePath].push(module);
    }
  }

  for (let parentModulePath in moduleMap) {
    let modules = moduleMap[parentModulePath];

    if (modules.length === 1) {
      modules[0].path = parentModulePath;
    }
  }
}

/**
 * "Hoists" default exports from a given module. This is particularly useful
 * for class files, which generally only export a single default class and
 * would normally look like this:
 *
 * /components/foo-component
 *   {{foo-component}}
 * /components/bar-component
 *   {{bar-component}}
 *
 * Instead they become this:
 *
 * /components
 *   {{foo-component}}
 *   {{bar-component}}
 *
 * Since these are the only exports of that type and the default, users can
 * generally infer that they can import the class from the file with the same
 * name as the class or component (in many cases this also doesn't matter
 * since the affected classes will be resolved).
 *
 * If a file has named exports they will continue to appear in that module:
 *
 * /components
 *   {{foo-component}}
 * /components/foo-component
 *   [func] utilityFunction
 *   [var] constantValue
 *   [class] HelperClass
 *
 * @param {Object} modules
 */
function hoistDefaults(modules) {
  let parentModules = {};

  for (let m in modules) {
    let module = modules[m];
    let parentModulePath = path.dirname(module.attributes.path);

    // Find or create the module
    parentModules[parentModulePath] = parentModules[parentModulePath] || new Module({ name: parentModulePath });

    let parentModule = parentModules[parentModulePath];

    if (module.relationships.classes.length >= 1) {
      let klass = module.relationships.classes[0];

      if (klass.attributes.exportType === 'default') {
        parentModule.relationships.classes.push(klass);
        module.relationships.classes.pop();
      }
    }

    if (module.attributes.functions.length >= 1) {
      let func = module.attributes.functions[0];

      if (func.exportType === 'default') {
        parentModule.attributes.functions.push(func);
        module.attributes.functions.pop();
      }
    }

    if (module.attributes.variables.length >= 1) {
      let variable = module.attributes.variables[0];

      if (variable.exportType === 'default') {
        parentModule.attributes.variables.push(variable);
        module.attributes.variables.pop();
      }
    }
  }

  // merge in the newly created parent modules
  Object.assign(modules, parentModules);

  // Remove any modules without exports now that hoisting is done
  for (let m in modules) {
    let module = modules[m];
    if (
      module.relationships.classes.length === 0
      && module.attributes.functions.length === 0
      && module.attributes.variables.length === 0
    ) {
      delete modules[m];
    }
  }
}

function linkParentClasses(klasses) {
  for (let k in klasses) {
    let klass = klasses[k];

    if (klass.parentClassId) {
      let parentClass = klasses[klass.parentClassId];

      if (parentClass) {
        klass.relationships.parentClass = parentClass;
      } else {
        klass.attributes.externalParentClass = klass.parentClassId;
      }
    }
  }
}

function sortByAttribute(attr) {
  return (a, b) => {
    if (a.attributes[attr] < b.attributes[attr]) {
      return -1;
    } else if (a.attributes[attr] > b.attributes[attr]) {
      return 1;
    }

    return 0;
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

fs.readFile('./input.js', 'utf8', );


class Esdoc2JsonApi extends Filter {
  constructor(inputTree, { project }) {
    super(...arguments);

    this.project = project;
  }

  processString(data) {
    let docs = JSON.parse(data);

    let modules = {};
    let klasses = {};

    for (let doc of docs) {
      if (isModule(doc)) {
        let module = new Module(doc);
        modules[module.id] = module;

      } else if (isModuleDocument(doc)) {
        let module = modules[doc.memberof];

        if (doc.export === false) continue;

        if (Component.detect(doc)) {
          let klass = new Component(doc);
          module.relationships.classes.push(klass);
          klasses[klass.id] = klass;

        } else if (Class.detect(doc)) {
          let klass = new Class(doc)
          module.relationships.classes.push(klass);
          klasses[klass.id] = klass;

        } else if (Helper.detect(doc)) {
          module.attributes.functions.push(new Helper(doc));

        } else if (Function.detect(doc)) {
          module.attributes.functions.push(new Function(doc));

        } else if (Variable.detect(doc)) {
          module.attributes.variables.push(new Variable(doc));
        }

      } else if (EmbeddedDocument(doc)) {
        let klass = klasses[doc.memberof];

        if (Method.detect(doc)) {
          klass.attributes.methods.push(new Method(doc));

        } else if (Argument.detect(doc)) {
          klass.attributes.arguments.push(new Argument(doc));

        } else if (Field.detect(doc)) {
          klass.attributes.fields.push(new Field(doc));
        }
      }
    }

    hoistPods(modules);
    hoistDefaults(modules);

    linkParentClasses(klasses);

    let includedModules = Object.values(modules).map(m => m.serialize());
    includedModules.sort(sortByAttribute('path'));

    let includedClasses = Object.values(klasses).map(k => k.serialize());
    includedClasses.sort(sortByAttribute('name'));

    let project = new Project({
      name: this.project.name,
      modules: includedModules
    });

    let payload = {
      data: project.serialize(),
      included: includedModules.concat(includedClasses)
    };

    return JSON.stringify(payload);
  }
}

module.exports = Esdoc2JsonApi;
