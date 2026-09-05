import { summarizeMonths } from './数学.mjs';

// A reporting window, not a civil year or a new intercalation policy.
// Partial months never enter the complete-month count identity.
export function solarWindowLedger(months, events, yearLength, count) {
  if (!Number.isFinite(yearLength) || yearLength <= 0 || !Number.isInteger(count) || count < 1 || count > 60 || months.length > 25000 || events.length > 12001)
    throw new RangeError('Invalid window budget');
  return Array.from({length:count}, (_,i) => {
    const start=i*yearLength, end=(i+1)*yearLength;
    const overlaps=months.filter(m=>m.start<end && m.end>start);
    const complete=overlaps.filter(m=>m.start>=start && m.end<=end);
    const fragments=overlaps.filter(m=>m.start<start || m.end>end).map(m=>({
      k:m.k, monthStart:m.start, monthEnd:m.end,
      overlapStart:Math.max(m.start,start), overlapEnd:Math.min(m.end,end),
    }));
    return {window:i+1,start,end,complete:complete.map(m=>m.k),fragments,
      stats:summarizeMonths(complete),
      eventsInWindow:events.filter(t=>t>=start && t<end).length};
  });
}
