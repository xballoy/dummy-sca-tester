const JSZip = require('jszip');

function newArchive() {
  return new JSZip();
}

module.exports = { newArchive };
