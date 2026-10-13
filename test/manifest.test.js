const assert = require('node:assert/strict');
const manifest = require('../package.json');

describe('Marketplace identity', () => {
  it('uses the registered CorpDrone Labs extension ID', () => {
    assert.equal(`${manifest.publisher}.${manifest.name}`, 'corpdrone-labs.vscode-beautify-revival');
  });
});
