
class Module {
  constructor({ name }) {
    this.id = name;
    this.type = 'module';

    // Attributes
    this.path = name.replace(/\.js$/, ''),
    this.functions = [];
    this.variables = [];

    // Relationships
    this.classes = [];
    this.components = [];
  }
}

module.exports = Module;
