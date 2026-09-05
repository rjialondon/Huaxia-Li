import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestRational, summarizeMonths } from "../src/core/数学.mjs";
import * as engine from "../src/core/历表.mjs";

test('zero is exactly 0/1, not a small positive leap rate', () => {
  assert.deepEqual(bestRational(0), { p: 0, q: 1, err: 0 });
  assert.deepEqual(bestRational(1), { p: 1, q: 1, err: 0 });
});
test('bounded rational search validates its inputs', () => {
  for (const x of [NaN, Infinity, -1, 1.1]) assert.throws(() => bestRational(x), RangeError);
  for (const x of [0, 1.5, Infinity, 10001]) assert.throws(() => bestRational(.3, x), RangeError);
  const r = bestRational(7/19);
  assert.equal(r.p, 7); assert.equal(r.q, 19);
});
test('integer month/year ratio can still have four empty months', () => {
  const months = Array.from({ length: 16 }, (_, k) => ({ zqCount: [0,20,40,60,80,100,120,140,160,180,200,220].filter(t => t >= 15*k && t < 15*(k+1)).length }));
  assert.deepEqual(summarizeMonths(months), { months:16, events:12, emptyMonths:4, extraEvents:0, netCount:4 });
});
test('empty months are not net count when a month has multiple events', () => {
  const r = summarizeMonths([0,0,0,1,2,3].map(zqCount => ({ zqCount })));
  assert.equal(r.emptyMonths, 3); assert.equal(r.netCount, 0); assert.equal(r.extraEvents, 3);
});
test('count identity for all 4^6 short event sequences', () => {
  for (let n=0; n<4096; n++) {
    const r = summarizeMonths(Array.from({length:6}, (_,i) => ({zqCount:(n >> (2*i)) & 3})));
    assert.equal(r.emptyMonths, r.netCount + r.extraEvents);
  }
  for (const zqCount of [-1, .5, NaN]) assert.throws(() => summarizeMonths([{zqCount}]), RangeError);
});
test('continuous floor difference is not discrete difference', () => {
  assert.equal(Math.floor(16/15)-Math.floor(16/20), 1);
  assert.equal(Math.floor(16/15-16/20), 0);
});

test('actual calendar counts every empty month, including several per group', () => {
  for (const [Y1, Ti, ecc] of [[240,15,0],[240,15,.6],[10471,642.8,.0489],[365.25,29.5306,.0167]]) {
    const state = {Y1,N:24,ecc,localDay:24,locked:false,sats:[{name:'test',Ti}],stars:[{name:'Star',mass:1}],overlays:[],binaryPeriod:0};
    const cal = engine.generateCalendar(state, engine.compute(state));
    const listed = cal.years.flatMap(y=>y.months);
    assert.equal(cal.totalLeap, listed.filter(m=>m.zqCount===0).length);
    assert.equal(cal.leapYears, cal.years.filter(y=>y.hasLeap).length);
    assert.equal(cal.totalLeap, cal.eventStats.netCount + cal.eventStats.extraEvents);
    if (Y1===240 && ecc===0) {
      // Legacy grouping closes on the 12th event, before the last empty
      // month of this solar year. Do not confuse its group with [0,240).
      assert.equal(cal.years[0].months.length,15);
      assert.equal(listed.filter(m=>m.start>=0 && m.start<240 && m.zqCount===0).length,4);
      assert.ok(cal.totalLeap>cal.leapYears);
    }
  }
});
