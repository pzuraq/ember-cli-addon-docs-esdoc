const JsonApiModel = require('./base-classes/json-api');

class Module extends JsonApiModel {
  constructor({ name }) {
    super(...arguments);
    this.id = name;
    this.type = 'module';

    this.attributes = {
      path: name.replace(/\.js$/, ''),
      functions: [],
      variables: []
    };

    this.relationships = {
      classes: [],
      components: []
    }
  }
}

module.exports = Module;
