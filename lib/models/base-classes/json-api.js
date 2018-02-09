
class JsonApiModel {
  constructor() {
    this.attributes = {};
    this.relationships = {};
  }

  serialize() {
    let { id, type, attributes, relationships: internalRelationships } = this;

    let relationships = {};

    for (let key in internalRelationships) {
      let relationship = internalRelationships[key];

      if (Array.isArray(relationship)) {
        relationships[key] = {
          data: relationship.map(({ id, type }) => ({ id, type }))
        };
      } else {
        relationships[key] = {
          data: relationship ? { id: relationship.id, type: relationship.type } : null
        };
      }
    }

    return {
      id,
      type,
      attributes,
      relationships
    }
  }
}

module.exports = JsonApiModel
