import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute, generateCalendar, keplerTermTime, BOUNDARIES } from '../src/core/历表.mjs';
import { evaluateModel } from '../src/core/模型.mjs';
import { PRESETS } from '../src/core/预设.mjs';
import { validateParameters, ParameterError, LIMITS } from '../src/core/参数校验.mjs';
const earth = () => structuredClone(PRESETS.earth);

test('all actual UI presets are valid and finite, without mutation', () => {
  for (const preset of Object.values(PRESETS)) {
    const before = JSON.stringify(preset);
    const { errors, r, cal } = evaluateModel(preset);
    assert.deepEqual(errors, []);
    assert.ok(Number.isFinite(r.Z));
    assert.ok(cal.type === 'solar' || cal.type === 'lunisolar');
    assert.equal(JSON.stringify(preset), before);
  }
});
test('empty, nonfinite and out-of-range fields stop both outputs', () => {
  for (const [field, values] of [
    ['Y1', ['', NaN, Infinity, 0, -1, 1e10]],
    ['N', ['', 0, 3, 5, 24.5, 362, Infinity]],
    ['ecc', ['', -.1, 1, NaN, Infinity]],
    ['localDay', ['', -.1, Infinity]],
    ['binaryPeriod', ['', -1, Infinity]],
    ['locked', ['', 1, null]],
  ]) for (const value of values) {
    const state = {...earth(), [field]:value};
    const result = evaluateModel(state);
    assert.ok(result.errors.some(e=>e.field===field));
    assert.equal(result.r,null); assert.equal(result.cal,null);
    assert.throws(()=>compute(state), ParameterError);
    assert.throws(()=>generateCalendar(state), ParameterError);
  }
});
test('invalid item values, blank names and collection sizes are rejected', () => {
  for (const [list, number] of [['stars','mass'],['sats','Ti'],['overlays','period']]) {
    for (const value of ['', 0, -1, NaN, Infinity, 1e10]) {
      const state=earth(); state[list][0][number]=value;
      assert.ok(validateParameters(state).length);
    }
    for (const name of ['', '  ', 'x'.repeat(121)]) {
      const state=earth(); state[list][0].name=name;
      assert.ok(validateParameters(state).length);
    }
    const state=earth(); state[list]=Array.from({length:33},()=>state[list][0]);
    assert.ok(validateParameters(state).some(e=>e.field===list));
  }
  assert.ok(validateParameters({...earth(), stars:[]}).length);
  assert.ok(validateParameters(null).length);
});
test('zero optional periods and empty satellite/overlay lists remain valid', () => {
  assert.deepEqual(validateParameters({...earth(),localDay:0,binaryPeriod:0,sats:[],overlays:[]}),[]);
});
test('maximum supported resolution remains within the month budget', () => {
  const state={...earth(),Y1:360,N:360,ecc:.99,sats:[{name:'M',Ti:1}]};
  const result=evaluateModel(state);
  assert.deepEqual(result.errors,[]);
  assert.ok(result.cal.years.flatMap(y=>y.months).length <= 25000);
  assert.equal(LIMITS.maxItems,32);
});
test('half-open month boundaries assign coincident events exactly once', () => {
  const state={...earth(),Y1:240,N:24,ecc:0,sats:[{name:'M',Ti:15}]};
  const cal=generateCalendar(state);
  const months=cal.years.flatMap(y=>y.months).filter(m=>m.start<240);
  assert.equal(months.length,16);
  for(let time=0;time<240;time+=20) {
    assert.equal(months.filter(m=>m.start<=time && time<m.end).length,1);
  }
  assert.equal(months[3].end,60); assert.equal(months[3].zqCount,0);
  assert.equal(months[4].start,60); assert.equal(months[4].zqCount,1);
  assert.equal(BOUNDARIES.month,'[start,end)');
});
test('rounded day display does not decide event ownership', () => {
  const cal=generateCalendar(earth());
  const months=cal.years.flatMap(y=>y.months);
  for(const m of months) assert.equal(m.length,Math.round(m.end)-Math.round(m.start));
  assert.ok(months.some(m=>m.start!==Math.round(m.start)));
});
test('calendar cannot use a stale caller-supplied classification', () => {
  assert.deepEqual(generateCalendar(earth(), {modeA:[]}),generateCalendar(earth()));
});
test('public Kepler entry validates arguments and preserves ordered endpoints', () => {
  for (const args of [[-1,24,0,240],[1,5,0,240],[1,24,1,240],[1,24,0,Infinity]])
    assert.throws(()=>keplerTermTime(...args),RangeError);
  for(const e of [0,.0167,.6,.95,.99]) {
    const times=Array.from({length:25},(_,k)=>keplerTermTime(k,24,e,240));
    assert.equal(times[0],0); assert.equal(times[24],240);
    assert.ok(times.slice(1).every((t,i)=>t>times[i]));
  }
});
