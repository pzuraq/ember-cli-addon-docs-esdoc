function extractTypes(decorator) {
  // For now we're just doing simple extracting, in the future
  // we should work on this to make it better
  if (decorator && decorator.arguments) {
    // remove quotes and surrounding parens
    let type = decorator.arguments.replace(/['"]/g, '').match(/^\((.*)\)$/)[1];

    return [type];
  }

  return ['*'];
}

module.exports = extractTypes
