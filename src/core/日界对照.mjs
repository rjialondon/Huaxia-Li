import { summarizeMonths } from './数学.mjs';

function lowerBound(values, target) {
  let lo=0, hi=values.length;
  while(lo<hi) {const mid=Math.floor((lo+hi)/2);if(values[mid]<target)lo=mid+1;else hi=mid;}
  return lo;
}

// Relative days with midnight at each integer, not a timezone or civil calendar.
// Compare exactly the supplied consecutive month indices under two boundaries.
export function compareDayBoundaries(months, events) {
  if (!Array.isArray(months) || !months.length || months.length>25000 || !Array.isArray(events) || events.length>12001)
    throw new RangeError('Invalid comparison budget');
  if(events.some((t,i)=>!Number.isFinite(t) || (i>0 && t<events[i-1]))) throw new RangeError('Events must be finite and sorted');
  if(months.some((m,i)=>!Number.isFinite(m.start) || !Number.isFinite(m.end) || m.end-m.start<1 || (i>0 && m.start!==months[i-1].end)))
    throw new RangeError('Months must be finite, consecutive and at least one day long');
  const rows=months.map((m,i)=>{
    const dayStart=Math.floor(m.start), dayEnd=Math.floor(m.end);
    const a=lowerBound(events,m.start), b=lowerBound(events,m.end);
    const c=lowerBound(events,dayStart), d=lowerBound(events,dayEnd);
    const gained=events.slice(c,a), lost=events.slice(d,b);
    return {monthIndex:m.k ?? i+1,start:m.start,end:m.end,dayStart,dayEnd,
      instantCount:b-a, dayCount:d-c,
      instantEmpty:b===a, dayEmpty:d===c,
      gained, lost, changed:gained.length>0 || lost.length>0};
  });
  const instant=summarizeMonths(rows.map(r=>({zqCount:r.instantCount})));
  const wholeDay=summarizeMonths(rows.map(r=>({zqCount:r.dayCount})));
  return {convention:'relative-day-midnight-0; half-open intervals; floor, not round',
    scope:{monthCount:months.length,instantStart:months[0].start,instantEnd:months.at(-1).end,
      dayStart:rows[0].dayStart,dayEnd:rows.at(-1).dayEnd},
    instant,wholeDay,changedMonths:rows.filter(r=>r.changed).length,
    changedEmptyLabels:rows.filter(r=>r.instantEmpty!==r.dayEmpty).length,
    outerGained:rows[0].gained,outerLost:rows.at(-1).lost,rows};
}
