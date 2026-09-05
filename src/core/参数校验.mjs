// Engineering limits for the local demonstration, not physical validity bounds.
export const LIMITS = Object.freeze({ maxItems: 32, maxName: 120, minPeriod: 1e-6, maxPeriod: 1e9, maxN: 360 });

export function validateParameters(state) {
  const errors = [];
  const add = (field, zh, en) => errors.push({ field, zh, en });
  if (!state || typeof state !== 'object') return [{field:'state',zh:'参数须为对象',en:'Parameters must be an object'}];
  function number(field, value, min, max) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
      add(field, `须填写 ${min} 至 ${max} 的有限数值`, `Enter a finite number from ${min} to ${max}`);
  }
  number('Y1', state.Y1, .001, LIMITS.maxPeriod);
  number('localDay', state.localDay, 0, LIMITS.maxPeriod);
  number('ecc', state.ecc, 0, .99);
  number('binaryPeriod', state.binaryPeriod, 0, LIMITS.maxPeriod);
  if (!Number.isInteger(state.N) || state.N < 4 || state.N > LIMITS.maxN || state.N % 2 !== 0)
    add('N', '须为4至360的偶整数；不自动改写输入', 'Must be an even integer from 4 to 360; input is not rounded');
  if (typeof state.locked !== 'boolean') add('locked', '须为布尔值', 'Must be a boolean');
  for (const [key, numeric, minItems] of [['stars','mass',1], ['sats','Ti',0], ['overlays','period',0]]) {
    const list = state[key];
    if (!Array.isArray(list) || list.length < minItems || list.length > LIMITS.maxItems) {
      add(key, `条目数须为${minItems}至${LIMITS.maxItems}`, `Requires ${minItems}–${LIMITS.maxItems} entries`);
      continue;
    }
    list.forEach((item, i) => {
      const path = `${key}[${i+1}]`;
      if (!item || typeof item !== 'object') { add(path, '条目须为对象', 'Entry must be an object'); return; }
      if (typeof item.name !== 'string' || !item.name.trim() || item.name.length > LIMITS.maxName)
        add(`${path}.name`, '名称须为1至120字符，且不可全为空白', 'Name must contain 1–120 characters and not be blank');
      number(`${path}.${numeric}`, item[numeric], LIMITS.minPeriod, LIMITS.maxPeriod);
    });
  }
  if (errors.length === 0) {
    const eligible = state.sats.map((s,i) => ({s,i})).filter(({s}) => s.Ti >= 1 && s.Ti >= state.Y1/state.N && s.Ti < 2*state.Y1/state.N);
    const selected = state.primarySatellite;
    if (selected !== undefined && selected !== null) {
      if (!Number.isInteger(selected) || !eligible.some(({i}) => i === selected))
        add('primarySatellite', '所选主历卫星已无效或不属甲型，请重新选择', 'Selected calendar satellite is invalid or not Mode A; choose again');
    } else if (eligible.length > 1) {
      add('primarySatellite', '多个甲型卫星时须明确选择，不自动取第一个', 'Choose a calendar satellite explicitly when multiple Mode A satellites exist');
    }
  }
  return errors;
}

export class ParameterError extends RangeError {
  constructor(errors) { super(errors.map(e=>`${e.field}: ${e.en}`).join('; ')); this.errors = errors; }
}
export function assertParameters(state) {
  const errors = validateParameters(state);
  if (errors.length) throw new ParameterError(errors);
}
