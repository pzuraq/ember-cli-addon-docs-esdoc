const crypto = require('crypto');

module.exports = function hash(str) {
  return crypto.createHash('sha256').update(str).digest('base64').substr(0, 10);
}
