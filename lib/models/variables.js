const EmbeddedDocumentModel = require('./base-classes/embedded-document');

const { extractDecoratorType } = require('./utils/type');

function findAndRemoveBy(array, key, value) {
  let index = array.findIndex(v => v[key] === value);

  if (index !== -1) {
    let [found] = array.splice(index, 1);
    return found;
  }
}

class Variable extends EmbeddedDocumentModel {
  constructor({ type }) {
    super(...arguments);

    this.type = ((type && type.types) || []).join('|') || '*';
  }

  static detect(doc) {
    return doc.kind === 'variable';
  }
}

class Field extends Variable {
  constructor({ static: isStatic, decorators = [] }) {
    super(...arguments);

    this.isStatic = isStatic;
    this.decorators = decorators;

    this.type = extractDecoratorType(findAndRemoveBy(this.decorators, 'name', 'type')) || this.type;
    this.isRequired = !!findAndRemoveBy(this.decorators, 'name', 'required');
    this.isImmutable = !!findAndRemoveBy(this.decorators, 'name', 'immutable');
  }

  static detect(doc) {
    return doc.kind === 'member';
  }
}

class Argument extends Field {
  static detect(doc) {
    return super.detect(doc) && !!(
      doc.unknown && doc.unknown.find(u => u.tagName === '@argument')
      || doc.decorators && doc.decorators.find(d => d.name === 'argument')
    );
  }
}

module.exports = { Variable, Field, Argument };
