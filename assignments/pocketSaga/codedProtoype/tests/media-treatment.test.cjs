const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../components/media-treatment.js'), 'utf8');
function load(extra = {}) {
  const scope = { window: { pocketSagaData: { media: [] } }, ...extra };
  vm.createContext(scope); vm.runInContext(source, scope);
  return scope.window.PocketSagaMedia;
}
const solid = (level, alpha = 255, count = 100) => Array.from({ length: count }, () => [level, level, level, alpha]).flat();
test('two states, with a deliberate luminance threshold rather than a mid state', () => {
  const api = load();
  assert.equal(api.measure(solid(0)).state, 'not-bright');
  assert.equal(api.measure(solid(143)).state, 'not-bright');
  assert.equal(api.measure(solid(145)).state, 'bright');
  assert.equal(api.measure(solid(255)).state, 'bright');
  assert.deepEqual(Object.keys(api.profiles).sort(), ['bright', 'not-bright']);
});
test('substantial bright patches trigger the bright treatment', () => {
  const api = load();
  assert.equal(api.measure([...solid(190, 255, 28), ...solid(0, 255, 72)]).state, 'bright');
  assert.equal(api.measure([...solid(190, 255, 27), ...solid(0, 255, 73)]).state, 'not-bright');
  assert.equal(api.measure([...solid(255, 0), ...solid(0)]).state, 'not-bright');
});
test('analysis caches image work and handles unreadable assets', async () => {
  let loads = 0;
  class Image { set src(value) { loads++; queueMicrotask(() => this.onerror()); } }
  const api = load({ Image, setTimeout, clearTimeout, location: { protocol: 'https:' } });
  const first = api.analyze('unreadable.jpg');
  assert.equal(first, api.analyze('unreadable.jpg'));
  const result = await first;
  assert.equal(loads, 1);
  assert.equal(result.state, 'not-bright');
  assert.equal(result.unavailable, true);
  assert.equal(api.get('unreadable.jpg'), api.profiles['not-bright']);
});
