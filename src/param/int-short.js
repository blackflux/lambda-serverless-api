import Int from './int.js';

class IntShort extends Int {
  constructor(name, position, opts = {}) {
    super(name, position, { ...opts, min: -32768, max: 32767 });
  }
}
export default IntShort;
