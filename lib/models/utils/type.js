module.exports.joinTypes = function joinTypes(typed) {
  typed.type = typed.types ? typed.types.join('|') : '*';
  delete typed.types;

  return typed;
}

module.exports.extractDecoratorType = function extractDecoratorType(decorator) {
  // For now we're just doing simple extracting, in the future
  // we should work on this to make it better
  if (decorator && decorator.arguments) {
    // remove quotes and surrounding parens
    return decorator.arguments.replace(/['"]/g, '').match(/^\((.*)\)$/)[1];
  }
}
