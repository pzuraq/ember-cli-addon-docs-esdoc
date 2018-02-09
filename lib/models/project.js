const JsonApiModel = require('./utils/json-api');

class Project extends JsonApiModel {
  constructor({ name, version, modules }) {
    super(...arguments);
    this.id = name;
    this.type = 'project';

    this.attributes = {
      version
    };

    this.relationships = {
      modules
    };
  }
}

module.exports = Project
