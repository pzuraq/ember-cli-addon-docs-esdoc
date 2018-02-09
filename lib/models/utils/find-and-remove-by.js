function findAndRemoveBy(array, key, value) {
  let index = array.findIndex(v => v[key] === value);

  if (index !== -1) {
    let [found] = array.splice(index, 1);
    return found;
  }
}

module.exports = findAndRemoveBy;
