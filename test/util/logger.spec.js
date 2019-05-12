/* eslint-disable no-console */
const assert = require('assert');
const { expect } = require('chai');
const logger = require('../../src/util/logger');

describe('Testing logger.', () => {
  const consoleLogOriginal = console.log;
  const logs = [];

  beforeEach(() => {
    assert(logs.length === 0);
    console.log = msg => logs.push(msg);
  });

  afterEach(() => {
    logs.length = 0;
    console.log = consoleLogOriginal;
  });


  it('Testing logger types.', () => {
    expect(Object.keys(logger)).to.deep.equal(['debug', 'info', 'warning', 'error', 'critical']);
  });

  it('Testing single message.', () => {
    logger.info('message');
    expect(logs).to.deep.equal(['INFO: message']);
  });

  it('Testing multiple messages.', () => {
    logger.info('message1', 'message2');
    expect(logs).to.deep.equal(['INFO: message1', 'INFO: message2']);
  });
});
