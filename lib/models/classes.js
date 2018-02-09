const JsonApiModel = require('./base-classes/json-api');
const findAndRemoveBy = require('./utils/find-and-remove-by');

class Class extends JsonApiModel {
  constructor({
    longname,
    name,
    importStyle,
    description,
    lineNumber,
    access,
    decorators = [],
    unknown: tags = [],
    extends: extendsFrom,
    interface: isInterface
  }) {
    super(...arguments);
    this.id = longname;
    this.type = 'class';

    // Can't add the parent class until after we've discovered all the rest of classes
    this.parentClassId = extendsFrom ? extendsFrom[0] : null;

    let exportType = importStyle ? importStyle.match(/{.+}/) === null ? 'default' : 'named' : null;
    let importPath = longname.split('~')[0];

    this.attributes = {
      name,
      importPath,
      exportType,
      description,
      lineNumber,
      access,
      isInterface,
      decorators,
      tags,

      fields: [],
      methods: []
    }

    this.relationships = {
      parentClass: null
    };
  }

  static detect(doc) {
    return doc.kind === 'class';
  }
}

class Component extends Class {
  constructor({ properties }) {
    super(...arguments);
    this.type = 'component';

    let yieldTag = findAndRemoveBy(this.attributes.tags, 'tagName', '@yields');

    let yields = yieldTag ? {
      types: yieldTag.tagValue.match(/{(.*)}/)[1].split('|'),
      description: yieldTag.tagValue.match(/{.*} -?(.*)/)[1].trim(),
      properties: properties || []
    } : null;

    this.attributes.yields = yields;
    this.attributes.arguments = [];
  }

  static detect(doc) {
    return super.detect(doc) && doc.memberof.match(/\/components\//) !== null;
  }
}

module.exports = { Class, Component };
