class EmbeddedDocumentModel {
  constructor({
    longname,
    name,
    importStyle,
    description,
    lineNumber,
    access,
    unknown: tags = []
  }) {
    let exportType = importStyle ? importStyle.match(/{.+}/) !== null ? 'named' : 'default' : null;
    let importPath = exportType === null ? null : longname.split('~')[0];

    this.name = name;
    this.importPath = importPath;
    this.description = description;
    this.exportType = exportType;
    this.lineNumber = lineNumber;
    this.access = access;
    this.tags = tags;
  }
}

module.exports = EmbeddedDocumentModel;
