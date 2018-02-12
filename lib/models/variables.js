const EmbeddedDocumentModel = require('./base-classes/embedded-document');

const extractTypes = require('./utils/extract-types');
const findAndRemoveBy = require('./utils/find-and-remove-by');

class Variable extends EmbeddedDocumentModel {
  constructor({ type }) {
    super(...arguments);
    this.type = 'variable';

    this.types = (type && type.types) || [];
  }

  static detect(doc) {
    return doc.kind === 'variable';
  }
}

class Field extends Variable {
  constructor({ static: isStatic, decorators = [] }) {
    super(...arguments);
    this.type = 'field';

    this.isStatic = isStatic;
    this.decorators = decorators;

    this.types = extractTypes(findAndRemoveBy(this.decorators, 'name', 'type'))
    this.isRequired = !!findAndRemoveBy(this.decorators, 'name', 'required');
    this.isImmutable = !!findAndRemoveBy(this.decorators, 'name', 'immutable');
  }

  static detect(doc) {
    return doc.kind === 'member';
  }
}

class Argument extends Field {
  constructor() {
    super(...arguments);
    this.type = 'argument';


  }

  static detect(doc) {
    return super.detect(doc) && !!(
      doc.unknown && doc.unknown.find(u => u.tagName === '@argument')
      || doc.decorators && doc.decorators.find(d => d.name === 'argument')
    );
  }
}

module.exports = { Variable, Field, Argument };
