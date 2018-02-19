const { joinTypes } = require('./utils/type');
const ParamParser = require('./utils/param-parser');

class Class {
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
    this.id = longname;
    this.type = 'class';

    let exportType = importStyle ? importStyle.match(/{.+}/) === null ? 'default' : 'named' : null;
    let file = longname.split('~')[0];

    // Attributes
    this.name = name;
    this.file = file;
    this.exportType = exportType;
    this.description = description;
    this.lineNumber = lineNumber;
    this.access = access;
    this.isInterface = isInterface;

    this.decorators = decorators;
    this.tags = tags;
    this.fields = [];
    this.methods = [];

    // Relationships
    this.parentClassId = extendsFrom ? extendsFrom[0] : null;
  }

  static detect(doc) {
    return doc.kind === 'class';
  }
}

class Component extends Class {
  constructor() {
    super(...arguments);
    this.type = 'component';

    // Attributes
    this.arguments = [];
    this.yields = this.tags.filter(t => t.tagName === '@yield').map(({ tagValue }) => {
      let { typeText, paramName, paramDesc } = ParamParser.parseParamValue(tagValue);
      let result = ParamParser.parseParam(typeText, paramName, paramDesc);

      return joinTypes(result);
    });
    this.tags = this.tags.filter(t => t.tagName !== '@yield');
  }

  static detect(doc) {
    return super.detect(doc) && doc.memberof.match(/\/components\//) !== null;
  }
}

module.exports = { Class, Component };
