const timezones = require('../resources/timezones');
const Enum = require('./enum');

class Timezone extends Enum {
  constructor(name, position, opts) {
    super(name, position, {
      ...opts,
      enums: timezones
    });
  }
}
module.exports = Timezone;
