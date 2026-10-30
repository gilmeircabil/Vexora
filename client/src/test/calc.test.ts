import { describe, it, expect } from 'vitest';
import {
  calculatePercentageOf,
  calculateWhatPercent,
  calculatePercentageChange,
} from '../lib/calc/percentage.js';
import { convertUnits } from '../lib/calc/units.js';
import { calculateDateDifference } from '../lib/calc/dates.js';
import {
  parseHexColor,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  getContrastRatio,
} from '../lib/calc/colors.js';

describe('Percentage Calculations', () => {
  it('calculates percentage of a value', () => {
    expect(calculatePercentageOf(20, 150)).toBe(30);
    expect(calculatePercentageOf(0, 150)).toBe(0);
  });

  it('calculates what percentage one number is of another with zero safeguard', () => {
    const res = calculateWhatPercent(25, 100);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value).toBe(25);

    const divZero = calculateWhatPercent(25, 0);
    expect(divZero.ok).toBe(false);
  });

  it('calculates percentage change (increase and decrease)', () => {
    const increase = calculatePercentageChange(50, 75);
    expect(increase.ok).toBe(true);
    if (increase.ok) {
      expect(increase.value.percentChange).toBe(50);
      expect(increase.value.isIncrease).toBe(true);
    }

    const decrease = calculatePercentageChange(100, 80);
    expect(decrease.ok).toBe(true);
    if (decrease.ok) {
      expect(decrease.value.percentChange).toBe(-20);
      expect(decrease.value.isIncrease).toBe(false);
    }
  });
});

describe('Unit Conversions', () => {
  it('converts length units accurately', () => {
    // 1 meter = 1000 millimeters
    const mm = convertUnits(1, 'meter', 'millimeter');
    expect(mm.ok).toBe(true);
    if (mm.ok) expect(mm.value).toBe(1000);

    // 1 mile to kilometers
    const km = convertUnits(1, 'mile', 'kilometer');
    expect(km.ok).toBe(true);
    if (km.ok) expect(Number(km.value.toFixed(4))).toBe(1.6093);
  });

  it('converts temperature between Celsius, Fahrenheit, and Kelvin', () => {
    const f = convertUnits(0, 'celsius', 'fahrenheit');
    expect(f.ok).toBe(true);
    if (f.ok) expect(f.value).toBe(32);

    const c = convertUnits(212, 'fahrenheit', 'celsius');
    expect(c.ok).toBe(true);
    if (c.ok) expect(c.value).toBe(100);

    const k = convertUnits(0, 'celsius', 'kelvin');
    expect(k.ok).toBe(true);
    if (k.ok) expect(k.value).toBe(273.15);
  });

  it('rejects conversions between incompatible units', () => {
    const res = convertUnits(10, 'meter', 'kilogram');
    expect(res.ok).toBe(false);
  });
});

describe('Date Difference Calculator', () => {
  it('calculates exact calendar day differences', () => {
    const res = calculateDateDifference('2026-01-01', '2026-01-11', false);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.totalDays).toBe(10);
      expect(res.value.totalWeeks).toBe(1);
      expect(res.value.remainingDays).toBe(3);
    }
  });

  it('correctly applies inclusive counting (+1 day)', () => {
    const res = calculateDateDifference('2026-01-01', '2026-01-11', true);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.totalDays).toBe(11);
    }
  });
});

describe('Color Conversions & Contrast', () => {
  it('converts HEX to RGB and back', () => {
    const hex = '#4F46E5';
    const parsed = parseHexColor(hex);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.r).toBe(79);
      expect(parsed.value.g).toBe(70);
      expect(parsed.value.b).toBe(229);
      expect(rgbToHex(parsed.value)).toBe(hex);
    }
  });

  it('converts RGB to HSL and back', () => {
    const rgb = { r: 255, g: 0, b: 0 };
    const hsl = rgbToHsl(rgb);
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);

    const backRgb = hslToRgb(hsl);
    expect(backRgb.r).toBe(255);
    expect(backRgb.g).toBe(0);
    expect(backRgb.b).toBe(0);
  });

  it('calculates WCAG contrast ratio accurately', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    const ratio = getContrastRatio(black, white);
    expect(ratio).toBe(21);
  });
});
