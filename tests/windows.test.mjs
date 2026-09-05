import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateCalendar} from '../src/core/历表.mjs';
import {evaluateModel} from '../src/core/模型.mjs';
import {PRESETS} from '../src/core/预设.mjs';
import {solarWindowLedger} from '../src/core/窗口.mjs';
const base=()=>({...structuredClone(PRESETS.earth),Y1:240,N:24,ecc:0,sats:[{name:'A',Ti:15},{name:'B',Ti:16}]});

test('ambiguous satellites stop output until explicitly selected',()=>{
  assert.equal(evaluateModel(base()).cal,null);
  for(const index of [0,1]){
    const state={...base(),primarySatellite:index};
    const {r,cal,errors}=evaluateModel(state);
    assert.deepEqual(errors,[]); assert.equal(r.primary.name,state.sats[index].name);
    assert.equal(cal.Ti,state.sats[index].Ti);
    assert.equal(r.intercalary.monthsPerYear,state.Y1/cal.Ti);
  }
});
test('stale or ineligible explicit selections never fall back',()=>{
  for(const index of [-1,2,.5]) assert.equal(evaluateModel({...base(),primarySatellite:index}).cal,null);
  const s={...base(),primarySatellite:0};s.sats[0].Ti=1;
  assert.equal(evaluateModel(s).cal,null);
});
test('solar window and experimental group use visibly different endpoints',()=>{
  const cal=generateCalendar({...base(),primarySatellite:0});
  const w=cal.solarWindows[0];
  assert.equal(w.end,240);assert.equal(w.stats.months,16);assert.equal(w.stats.emptyMonths,4);
  assert.equal(w.fragments.length,0);assert.equal(w.eventsInWindow,12);
  assert.equal(cal.years[0].months.length,15);
  assert.equal(cal.years[0].months.at(-1).end,225);
});
test('crossing months are fragments, never complete months',()=>{
  const months=Array.from({length:4},(_,i)=>({k:i+1,start:i*6,end:(i+1)*6,zqCount:i===0?2:1}));
  const [a,b]=solarWindowLedger(months,[0,5,10,15,20],10,2);
  assert.deepEqual(a.complete,[1]);assert.deepEqual(b.complete,[3]);
  assert.deepEqual(a.fragments.map(f=>f.k),[2]);assert.deepEqual(b.fragments.map(f=>f.k),[2,4]);
  assert.equal(a.eventsInWindow,2);assert.equal(b.eventsInWindow,2);
  assert.equal(b.stats.events,1); // the other window event is in a fragment
  assert.equal(b.fragments[0].overlapStart,10);assert.equal(b.fragments[0].overlapEnd,12);
});
test('Earth and high-eccentricity windows conserve coverage and complete-month identity',()=>{
  for(const ecc of [0,.0167,.6,.95]){
    const cal=generateCalendar({...PRESETS.earth,ecc});
    for(const w of cal.solarWindows){
      assert.equal(w.stats.emptyMonths,w.stats.netCount+w.stats.extraEvents);
      assert.equal(w.eventsInWindow,12);
      const duration=w.complete.length*cal.Ti+w.fragments.reduce((s,f)=>s+f.overlapEnd-f.overlapStart,0);
      assert.ok(Math.abs(duration-cal.Y1)<1e-8);
      assert.ok(w.complete.every(k=>!w.fragments.some(f=>f.k===k)));
    }
  }
});
