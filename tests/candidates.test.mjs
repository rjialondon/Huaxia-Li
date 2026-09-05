import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {toSynodic} from '../src/core/数学.mjs';
import {CANDIDATES, analyzeCandidate} from '../src/core/候选演算.mjs';
import {CANDIDATE_EVIDENCE} from '../src/core/候选来源.mjs';

test('prograde approximation has an explicit finite positive domain',()=>{
  for(const [t,y] of [[0,365],[-1,365],[NaN,365],[1,Infinity],[1,NaN],[365,365],[400,365]]) assert.equal(toSynodic(t,y),Infinity);
  assert.ok(Math.abs(toSynodic(19,287.38)-1/(1/19-1/287.38))<1e-12);
});
test('all displayed candidate cards have bilingual scoped provenance',()=>{
  for(const c of CANDIDATES){
    assert.ok(CANDIDATE_EVIDENCE[c.id].zh); assert.ok(CANDIDATE_EVIDENCE[c.id].en);
    const a=analyzeCandidate(c); assert.ok(Number.isFinite(a.Tsyn));
    assert.ok(a.TsynRange[0]<=a.Tsyn && a.Tsyn<=a.TsynRange[1]);
    if(c.id!=='earth_ref') assert.equal(c.confirmed,false);
  }
});
test('sub-diurnal candidate is not Mode A even if it meets the mean inequality',()=>{
  const c={...CANDIDATES[0],Y1:24,N:24,Ti_est:1.5,Ti_range:[1.4,1.6],TiIsSynodic:true,localDay:48};
  const a=analyzeCandidate(c); assert.equal(a.belowDay,true); assert.equal(a.inModeA,false); assert.equal(a.rangeOverlapsA,false);
});
test('Mode A upper bound is excluded for point and interval',()=>{
  const c={...CANDIDATES[0],Y1:24,N:24,Ti_est:2,Ti_range:[2,2],TiIsSynodic:true,localDay:1};
  assert.equal(analyzeCandidate(c).inModeA,false); assert.equal(analyzeCandidate(c).rangeOverlapsA,false);
});
test('removed overclaims stay absent from revised tool pages',()=>{
  for(const p of ['CrossVerification.jsx','ExomoonHunter.jsx']){
    const s=readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
    for(const claim of ['结构崩溃','Structural collapse','置闰自动成立','intercalation is automatic','Intercalary Prediction']) assert.ok(!s.includes(claim),claim);
  }
});
