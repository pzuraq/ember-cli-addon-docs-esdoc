class Project {
  constructor({ name, version, modules }) {
    this.id = name;
    this.type = 'project';

    // Attributes
    this.name = name;
    this.version = version;

    // Relationships
    this.modules = modules;
  }
}

module.exports = Project
