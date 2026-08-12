const ejs = require('ejs');
const lodash = require('lodash');
const minimist = require('minimist');

function renderGreeting(name) {
  const compiled = lodash.template('hello <%= user %>');
  return compiled({ user: name });
}

function renderTemplate(source, data) {
  return ejs.render(source, data);
}

function parseArgs(argv) {
  return minimist(argv);
}

module.exports = { renderGreeting, renderTemplate, parseArgs };
