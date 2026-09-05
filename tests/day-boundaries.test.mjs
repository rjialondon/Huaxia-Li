import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareDayBoundaries} from '../src/core/日界对照.mjs';
import {generateCalendar} from '../src/core/历表.mjs';
import {PRESETS} from '../src/core/预设.mjs';

test('event earlier on the new-moon day moves to the following month',()=>{
  const r=compareDayBoundaries([{start:0,end:29.5},{start:29.5,end:59}],[29.1]);
  assert.deepEqual(r.rows.map(x=>x.instantCount),[1,0]);
  assert.deepEqual(r.rows.map(x=>x.dayCount),[0,1]);
  assert.equal(r.changedMonths,2);assert.equal(r.changedEmptyLabels,2);
  assert.equal(r.instant.emptyMonths,r.wholeDay.emptyMonths);
});
test('same moment and exact midnight have unambiguous half-open ownership',()=>{
  const r=compareDayBoundaries([{start:0,end:29.5},{start:29.5,end:59}],[0,29,29.5,59]);
  assert.deepEqual(r.rows.map(x=>x.instantCount),[2,1]);
  assert.deepEqual(r.rows.map(x=>x.dayCount),[1,2]);
  assert.equal(r.instant.events,3);assert.equal(r.wholeDay.events,3);
});
test('outer boundary changes explain unequal event totals',()=>{
  const r=compareDayBoundaries([{start:.5,end:30.5}],[.25,30.25,30.4]);
  assert.deepEqual(r.outerGained,[.25]);assert.deepEqual(r.outerLost,[30.25,30.4]);
  assert.equal(r.wholeDay.events-r.instant.events,r.outerGained.length-r.outerLost.length);
});
test('binary searches agree with brute-force enumeration across fractional phases',()=>{
  for(let phase=-8;phase<=8;phase++)for(const period of [1,1.25,2.5,15,29.5]){
    const months=Array.from({length:20},(_,i)=>({start:phase/4+i*period,end:phase/4+(i+1)*period}));
    const events=Array.from({length:1000},(_,i)=>i*.75-10);
    const r=compareDayBoundaries(months,events);
    for(const row of r.rows){
      assert.equal(row.instantCount,events.filter(t=>t>=row.start && t<row.end).length);
      assert.equal(row.dayCount,events.filter(t=>Math.floor(t)>=row.dayStart && Math.floor(t)<row.dayEnd).length);
    }
    for(const stats of [r.instant,r.wholeDay])assert.equal(stats.emptyMonths,stats.netCount+stats.extraEvents);
    assert.equal(r.wholeDay.events-r.instant.events,r.outerGained.length-r.outerLost.length);
  }
});
test('production comparison preserves the existing instantaneous ledger',()=>{
  for(const ecc of [0,.0167,.6,.95]){
    const cal=generateCalendar({...PRESETS.earth,ecc});
    assert.deepEqual(cal.dayBoundaryComparison.instant,cal.eventStats);
    assert.equal(cal.dayBoundaryComparison.scope.monthCount,cal.years.flatMap(y=>y.months).length);
  }
});
test('malformed event sequences and month boundaries are rejected',()=>{
  assert.throws(()=>compareDayBoundaries([],[]),RangeError);
  assert.throws(()=>compareDayBoundaries([{start:0,end:30}],[2,1]),RangeError);
  assert.throws(()=>compareDayBoundaries([{start:0,end:30}],[NaN]),RangeError);
  assert.throws(()=>compareDayBoundaries([{start:0,end:30},{start:31,end:60}],[]),RangeError);
});
test('Earth demo separates net count from multiple-event compensation under either boundary',()=>{
  const d=generateCalendar(PRESETS.earth).dayBoundaryComparison;
  assert.equal(d.scope.monthCount,235);
  assert.equal(d.instant.events,228);assert.equal(d.wholeDay.events,228);
  assert.equal(d.instant.extraEvents,1);assert.equal(d.wholeDay.extraEvents,0);
  assert.equal(d.instant.emptyMonths,8);assert.equal(d.wholeDay.emptyMonths,7);
  assert.equal(d.changedMonths,6);assert.equal(d.changedEmptyLabels,5);
  assert.equal(d.outerGained.length+d.outerLost.length,0);
});
