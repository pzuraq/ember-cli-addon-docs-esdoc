const EmbeddedDocumentModel = require('./base-classes/embedded-document');
const { joinTypes } = require('./utils/type');

class Function extends EmbeddedDocumentModel {
  constructor({ params, return: returns, properties, async, generator }) {
    super(...arguments);

    this.returns = returns ? {
      type: returns.types.join('|'),
      description: returns.description,
      properties: (properties || []).map(joinTypes)
    } : null;

    this.params = (params || []).map(joinTypes);
    this.isAsync = async;
    this.isGenerator = generator;
  }

  static detect(doc) {
    return doc.kind === 'function';
  }
}

class Method extends Function {
  constructor({ static: isStatic, decorators = [] }) {
    super(...arguments);
    this.type = 'method';

    this.isStatic = isStatic;
    this.decorators = decorators;
  }

  static detect(doc) {
    return doc.kind === 'method';
  }
}

class Helper extends Function {
  constructor() {
    super(...arguments);
    this.type = 'helper';
  }

  static detect(doc) {
    return super.detect(doc) && doc.memberof.match(/\/helpers\//) !== null;
  }
}

module.exports = { Function, Method, Helper };
