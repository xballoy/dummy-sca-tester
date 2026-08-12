const ejs = require('ejs');
const lodash = require('lodash');
const minimist = require('minimist');

function render(source, data) {
  return ejs.render(source, lodash.defaults(data, { user: 'anonymous' }));
}

function parseArgs(argv) {
  return minimist(argv);
}

module.exports = { render, parseArgs };
