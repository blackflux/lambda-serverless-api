const path = require('path');
const fs = require('smart-fs');
const Enum = require('./enum');

class Timezone extends Enum {
  constructor(name, position, opts) {
    super(name, position, {
      ...opts,
      enums: fs.smartRead(path.join(__dirname, '..', 'resources', 'timezones.json'))
    });
  }
}
module.exports = Timezone;
