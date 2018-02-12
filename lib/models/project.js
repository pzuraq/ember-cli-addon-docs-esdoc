const JsonApiModel = require('./base-classes/json-api');

class Project extends JsonApiModel {
  constructor({ name, version, modules }) {
    super(...arguments);
    this.id = name;
    this.type = 'project';

    this.attributes = {
      name,
      version
    };

    this.relationships = {
      modules
    };
  }
}

module.exports = Project
