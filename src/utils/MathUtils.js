/**
 * Gala3D - Math & Geometry Utilities
 */

export const UNITS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial'
};

/**
 * Snap a value to the nearest step
 * @param {number} value
 * @param {number} step
 * @returns {number}
 */
export function snap(value, step = 0.5) {
  if (!step || step <= 0) return value;
  return Math.round(value / step) * step;
}

/**
 * Snap 3D vector coordinates to a grid on the XZ plane
 * @param {THREE.Vector3} vec
 * @param {number} step
 * @returns {THREE.Vector3}
 */
export function snapVector(vec, step = 0.5) {
  vec.x = snap(vec.x, step);
  vec.z = snap(vec.z, step);
  return vec;
}

/**
 * Snap an angle in radians to degrees interval (e.g. 15, 45, 90 deg)
 * @param {number} rad
 * @param {number} degStep
 * @returns {number}
 */
export function snapAngle(rad, degStep = 15) {
  const stepRad = (degStep * Math.PI) / 180;
  return Math.round(rad / stepRad) * stepRad;
}

/**
 * Convert meters to feet
 */
export function metersToFeet(m) {
  return m * 3.28084;
}

/**
 * Convert feet to meters
 */
export function feetToMeters(ft) {
  return ft / 3.28084;
}

/**
 * Format length display
 */
export function formatDimension(meters, unit = UNITS.METRIC) {
  if (unit === UNITS.IMPERIAL) {
    const totalInches = Math.round(meters * 39.3701);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}' ${inches}"`;
  }
  return `${meters.toFixed(2)} m`;
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'item') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}
