import timezones from '../resources/timezones.js';
import Enum from './enum.js';

class Timezone extends Enum {
  constructor(name, position, opts) {
    super(name, position, {
      ...opts,
      enums: timezones
    });
  }
}
export default Timezone;
