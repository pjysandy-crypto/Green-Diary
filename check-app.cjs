const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
function element(key) {
  if (!elements.has(key)) elements.set(key, { value: '', innerHTML: '', textContent: '', hidden: false, dataset: {}, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; }, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, removeAttribute() {}, close() {}, showModal() {} });
  return elements.get(key);
}
const context = vm.createContext({ console, Intl, Date, Math, Number, String, Map, Set, JSON, Array, Object, DOMException, AbortController, setTimeout, clearTimeout,
  crypto: { randomUUID: () => 'test-id' }, localStorage: { getItem: () => null, setItem() {} },
  document: { querySelector: element, querySelectorAll: () => [], addEventListener() {} },
  window: { scrollTo() {} }, fetch: async () => { throw new Error('offline'); },
});
vm.runInContext(fs.readFileSync('app.js', 'utf8'), context);
vm.runInContext(`
  state.plants = [{ id: 'basil', kind: 'basil', nickname: '초록이', emoji: '🌿', startDate: '2026-09-09' }];
  renderAll();
`, context);
assert.equal(element('#entry-plant').value, 'basil', 'Single plant selected automatically');
assert.equal(vm.runInContext("dayBadge(state.plants[0], '2026-10-14')", context), 'D +35');
assert.equal(vm.runInContext("dayBadge(state.plants[0], '2026-09-09')", context), 'D +0');
assert.equal(vm.runInContext("dayBadge(state.plants[0], '2026-09-08')", context), 'D −1 · 심기 전');
vm.runInContext("state.plants.push({ id: 'tomato', kind: 'tomato', startDate: '2026-10-01' }); renderAll();", context);
assert.equal(element('#entry-plant').value, 'basil', 'Selection preserved after adding another plant');
element('#entry-date').value = '2026-10-14';
element('#entry-observation').value = 'leaves';
element('#entry-observation').listeners.change();
assert.match(element('#guidance-list').innerHTML, /새잎이 자라고/);
element('#entry-note').value = '새잎!';
element('#entry-form').listeners.submit({ preventDefault() {} });
assert.equal(vm.runInContext('state.entries[0].observation', context), 'leaves', 'Observation persisted');
assert.match(element('#entry-list').innerHTML, /새잎이 났어요/);
assert.equal(element('#entry-observation').value, '', 'Observation cleared after saving');
element('#entry-date').value = '2026-10-14';
element('#entry-form').listeners.submit({ preventDefault() {} });
assert.equal(vm.runInContext('state.entries[1].observation', context), '', 'Observation optional');
element('#entry-observation').value = 'wilting';
element('#entry-observation').listeners.change();
assert.match(element('#guidance-list').innerHTML, /바로 물을 더 주지는/);
element('#entry-plant').value = 'tomato';
element('#entry-plant').listeners.change();
assert.equal(element('#entry-observation').value, '', 'Observation reset when switching plants');
assert.equal(vm.runInContext("dayDifference('2024-02-28', '2024-03-01')", context), 2);
vm.runInContext("weather = { temp: 30, humidity: 35, wind: 5, code: 0, rain: 0 };", context);
assert.match(vm.runInContext('careTips(state.plants[0]).join()', context), /마르면 흠뻑/);
vm.runInContext("weather = { temp: 8, humidity: 80, wind: 5, code: 61, rain: 4 };", context);
assert.match(vm.runInContext('careTips(state.plants[0]).join()', context), /과습/);
assert.match(vm.runInContext('careTips(state.plants[0]).join()', context), /찬바람/);
setImmediate(() => {
  assert.match(element('#weather-summary').textContent, /불러오지 못/);
  console.log('PASS: plant selection, D+ dates, optional observations, observation tips, switching plants, weather tips and offline fallback');
});
