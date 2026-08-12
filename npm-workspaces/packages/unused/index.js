const Handlebars = require('handlebars');

function escape(value) {
  return Handlebars.escapeExpression(String(value));
}

module.exports = { escape };
