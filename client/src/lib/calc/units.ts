import { Result, ok, err } from '../result.js';

export type UnitCategory = 'length' | 'mass' | 'temperature' | 'area' | 'volume';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  category: UnitCategory;
  toBase?: (val: number) => number;
  fromBase?: (val: number) => number;
  baseRatio?: number; // ratio to base unit (m, kg, m², L)
}

export const UNITS: Record<string, UnitDefinition> = {
  // Length (Base: Meter)
  meter: { id: 'meter', name: 'Meter', symbol: 'm', category: 'length', baseRatio: 1 },
  kilometer: {
    id: 'kilometer',
    name: 'Kilometer',
    symbol: 'km',
    category: 'length',
    baseRatio: 1000,
  },
  centimeter: {
    id: 'centimeter',
    name: 'Centimeter',
    symbol: 'cm',
    category: 'length',
    baseRatio: 0.01,
  },
  millimeter: {
    id: 'millimeter',
    name: 'Millimeter',
    symbol: 'mm',
    category: 'length',
    baseRatio: 0.001,
  },
  inch: { id: 'inch', name: 'Inch', symbol: 'in', category: 'length', baseRatio: 0.0254 },
  foot: { id: 'foot', name: 'Foot', symbol: 'ft', category: 'length', baseRatio: 0.3048 },
  yard: { id: 'yard', name: 'Yard', symbol: 'yd', category: 'length', baseRatio: 0.9144 },
  mile: { id: 'mile', name: 'Mile', symbol: 'mi', category: 'length', baseRatio: 1609.344 },

  // Mass (Base: Kilogram)
  kilogram: { id: 'kilogram', name: 'Kilogram', symbol: 'kg', category: 'mass', baseRatio: 1 },
  gram: { id: 'gram', name: 'Gram', symbol: 'g', category: 'mass', baseRatio: 0.001 },
  milligram: {
    id: 'milligram',
    name: 'Milligram',
    symbol: 'mg',
    category: 'mass',
    baseRatio: 0.000001,
  },
  pound: { id: 'pound', name: 'Pound', symbol: 'lb', category: 'mass', baseRatio: 0.45359237 },
  ounce: { id: 'ounce', name: 'Ounce', symbol: 'oz', category: 'mass', baseRatio: 0.028349523125 },
  tonne: { id: 'tonne', name: 'Metric Tonne', symbol: 't', category: 'mass', baseRatio: 1000 },

  // Temperature
  celsius: {
    id: 'celsius',
    name: 'Celsius',
    symbol: '°C',
    category: 'temperature',
    toBase: (c) => c,
    fromBase: (c) => c,
  },
  fahrenheit: {
    id: 'fahrenheit',
    name: 'Fahrenheit',
    symbol: '°F',
    category: 'temperature',
    toBase: (f) => ((f - 32) * 5) / 9,
    fromBase: (c) => (c * 9) / 5 + 32,
  },
  kelvin: {
    id: 'kelvin',
    name: 'Kelvin',
    symbol: 'K',
    category: 'temperature',
    toBase: (k) => k - 273.15,
    fromBase: (c) => c + 273.15,
  },

  // Area (Base: Square Meter)
  square_meter: {
    id: 'square_meter',
    name: 'Square Meter',
    symbol: 'm²',
    category: 'area',
    baseRatio: 1,
  },
  square_kilometer: {
    id: 'square_kilometer',
    name: 'Square Kilometer',
    symbol: 'km²',
    category: 'area',
    baseRatio: 1_000_000,
  },
  square_foot: {
    id: 'square_foot',
    name: 'Square Foot',
    symbol: 'ft²',
    category: 'area',
    baseRatio: 0.09290304,
  },
  acre: { id: 'acre', name: 'Acre', symbol: 'ac', category: 'area', baseRatio: 4046.8564224 },
  hectare: { id: 'hectare', name: 'Hectare', symbol: 'ha', category: 'area', baseRatio: 10000 },

  // Volume (Base: Liter)
  liter: { id: 'liter', name: 'Liter', symbol: 'L', category: 'volume', baseRatio: 1 },
  milliliter: {
    id: 'milliliter',
    name: 'Milliliter',
    symbol: 'mL',
    category: 'volume',
    baseRatio: 0.001,
  },
  cubic_meter: {
    id: 'cubic_meter',
    name: 'Cubic Meter',
    symbol: 'm³',
    category: 'volume',
    baseRatio: 1000,
  },
  gallon_us: {
    id: 'gallon_us',
    name: 'US Gallon',
    symbol: 'gal',
    category: 'volume',
    baseRatio: 3.785411784,
  },
  fluid_ounce_us: {
    id: 'fluid_ounce_us',
    name: 'US Fluid Ounce',
    symbol: 'fl oz',
    category: 'volume',
    baseRatio: 0.0295735295625,
  },
};

export function getUnitsByCategory(category: UnitCategory): UnitDefinition[] {
  return Object.values(UNITS).filter((u) => u.category === category);
}

export function convertUnits(
  value: number,
  fromUnitId: string,
  toUnitId: string,
): Result<number, string> {
  if (!Number.isFinite(value)) {
    return err('Input value must be a valid number.');
  }

  const fromUnit = UNITS[fromUnitId];
  const toUnit = UNITS[toUnitId];

  if (!fromUnit || !toUnit) {
    return err('Invalid unit specified.');
  }

  if (fromUnit.category !== toUnit.category) {
    return err(
      `Cannot convert between incompatible categories (${fromUnit.category} and ${toUnit.category}).`,
    );
  }

  // Same unit shortcut
  if (fromUnitId === toUnitId) {
    return ok(value);
  }

  // Temperature uses custom functions
  if (fromUnit.category === 'temperature') {
    const toBase = fromUnit.toBase || ((v) => v);
    const fromBase = toUnit.fromBase || ((v) => v);
    const baseValue = toBase(value);
    return ok(fromBase(baseValue));
  }

  // Linear baseRatio conversion
  if (fromUnit.baseRatio && toUnit.baseRatio) {
    const baseValue = value * fromUnit.baseRatio;
    const targetValue = baseValue / toUnit.baseRatio;
    return ok(targetValue);
  }

  return err('Conversion ratio missing.');
}
