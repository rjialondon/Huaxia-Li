import { compute, generateCalendar, BOUNDARIES } from './历表.mjs';
import { validateParameters } from './参数校验.mjs';

// Single UI entry: invalid edits never enter either calculation or reporting.
export function evaluateModel(state) {
  const errors = validateParameters(state);
  if (errors.length) return { errors, r: null, cal: null, boundaries: BOUNDARIES };
  return { errors: [], r: compute(state), cal: generateCalendar(state), boundaries: BOUNDARIES };
}
