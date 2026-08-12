const marked = require('marked');
const serialize = require('serialize-javascript');
const { quote } = require('shell-quote');

const { slugify } = require('./index');

function buildDocs(markdown, config) {
  return {
    html: marked(markdown),
    state: serialize(config),
    command: quote(['node', 'dist/index.js', slugify(config.name)])
  };
}

module.exports = { buildDocs };
