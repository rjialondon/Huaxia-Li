export const PRESETS = {
  // Y1 和 Tᵢ 均为本地日（行星自转次数）。localDay(小时) 仅作地球换算桥，可选。
  earth: {
    stars: [{ name: "Sun", mass: 1.0 }],
    Y1: 365.25, localDay: 24, ecc: 0.0167, locked: false, N: 24,
    sats: [{ name: "Moon", Ti: 29.5306 }],  // 地球本地日=1地球日，数值不变
    overlays: [{ name: "Jupiter (岁星)", period: 11.862 }],
    binaryPeriod: 0,
  },
  mars: {
    stars: [{ name: "Sun", mass: 1.0 }],
    // 1 火星日 = 24.66h = 1.0275 地球日；火星年 686.97÷1.0275 = 668.60 火星日
    // Tᵢ 均为会合(朔望)周期：T_syn = 1/(1/T_sid − 1/Y₁)，再除以本地日换算
    Y1: 668.60, localDay: 24.66, ecc: 0.0934, locked: false, N: 24,
    sats: [{ name: "Phobos", Ti: 0.3105 }, { name: "Deimos", Ti: 1.2309 }],
    overlays: [], binaryPeriod: 0,
  },
  jupiter: {
    stars: [{ name: "Sun", mass: 1.0 }],
    // 1 木星日 = 9.93h = 0.41375 地球日；木星年 4332.6÷0.41375 = 10471 木星日
    // Tᵢ 均为会合(朔望)周期换算（与输入框"朔望周期Tᵢ"口径一致）
    Y1: 10471, localDay: 9.93, ecc: 0.0489, locked: false, N: 24,
    sats: [{ name: "Io", Ti: 4.277 }, { name: "Europa", Ti: 8.590 }, { name: "Ganymede", Ti: 17.321 }, { name: "Callisto", Ti: 40.492 }, { name: "Himalia", Ti: 642.8 }],
    overlays: [], binaryPeriod: 0,
  },
  tatooine: {
    stars: [{ name: "Kepler-16A", mass: 0.69 }, { name: "Kepler-16B", mass: 0.20 }],
    // localDay=24 假设；1本地日=1地球日，数值不变
    Y1: 228.776, localDay: 24, ecc: 0.0069, locked: false, N: 24,
    sats: [],
    overlays: [{ name: "Binary orbit", period: 41.08 / 228.776 }],
    binaryPeriod: 41.08,
  },
  custom: {
    stars: [{ name: "Star A", mass: 1.0 }],
    Y1: 100, localDay: 0, ecc: 0, locked: false, N: 24,
    sats: [], overlays: [], binaryPeriod: 0,
  },
  extreme: {
    stars: [{ name: "Star X", mass: 1.0 }],
    // Y1 刻意避开 365.2425±0.02：此预设演示开普勒极端效应，
    // 复用地球年长会让公历判据"意外可工作"，模糊教学重点
    Y1: 400.25, localDay: 24, ecc: 0.95, locked: false, N: 24,
    sats: [], overlays: [], binaryPeriod: 0,
  },
};
