import { expect } from 'chai';
import { describe } from 'node-tdd';
import { identity } from './misc.js';
import { Api } from '../src/index.js';

const api = Api();

describe('Testing Params', () => {
  it('Testing Error for GET And JSON Param', (done) => {
    expect(() => api.wrap('GET route', [api.Str('name', 'json')], identity(api)))
      .to.throw('Can not use JSON parameter with GET requests.');
    done();
  });

  it('Testing Undefined Path Parameter', (done) => {
    expect(() => api.wrap('GET route/{otherId}', [api.Str('id', 'path')], identity(api)))
      .to.throw('Path Parameter not defined in given path.');
    done();
  });

  it('Testing Unknown Parameter Position', (done) => {
    expect(() => api.wrap('GET route', [api.Str('id', 'unknown')], identity(api)))
      .to.throw('Unknown Parameter Position: unknown');
    done();
  });
});
