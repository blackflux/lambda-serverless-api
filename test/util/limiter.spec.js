const expect = require('chai').expect;
const { describe } = require('node-tdd');
const Limiter = require('../../src/util/limiter');

describe('Testing limiter.js', {
  timestamp: 1598115247,
  cryptoSeed: 'd99efde9-9c6a-4336-bd99-18339fc38a38',
  envVarsFile: '../env.yml'
}, () => {
  let callLimiter;

  before(() => {
    callLimiter = (limiter) => limiter({
      identifier: 'identifier',
      route: 'route',
      data: {}
    });
  });

  it('Testing limiter', async () => {
    const limiter = Limiter({ bucket: null, globalLimit: 2, defaultRouteLimit: 2 });
    await callLimiter(limiter);
    const result = await callLimiter(limiter);
    expect(result).to.equal(undefined);
  });

  it('Testing "Global limit hit" and sets cache', async ({ capture }) => {
    const limiter = Limiter({ bucket: null, globalLimit: 0, defaultRouteLimit: 1 });
    const error = await capture(() => callLimiter(limiter));
    expect(error.message).to.equal('Global limit hit');
  });

  it('Testing "Global limit hit" with cache', async ({ capture }) => {
    const limiter = Limiter({ bucket: null, globalLimit: 0, defaultRouteLimit: 1 });
    const error1 = await capture(() => callLimiter(limiter));
    expect(error1.message).to.equal('Global limit hit');
    const error2 = await capture(() => callLimiter(limiter));
    expect(error2.message).to.equal('Global limit hit');
  });

  it('Testing "Endpoint limit hit" and sets cache', async ({ capture }) => {
    const limiter = Limiter({ bucket: null, globalLimit: 1, defaultRouteLimit: 0 });
    const error1 = await capture(() => callLimiter(limiter));
    expect(error1.message).to.equal('Endpoint limit hit');
  });

  it('Testing "Endpoint limit hit" with cache', async ({ capture }) => {
    const limiter = Limiter({ bucket: null, globalLimit: 1, defaultRouteLimit: 0 });
    const error1 = await capture(() => callLimiter(limiter));
    expect(error1.message).to.equal('Endpoint limit hit');
    const error2 = await capture(() => callLimiter(limiter));
    expect(error2.message).to.equal('Endpoint limit hit');
  });
});
