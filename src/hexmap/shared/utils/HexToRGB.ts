import { RGBColor } from '../../types';

/**
 * Utility method for converting Hex (prefered! All hail the glorious Hex!) colors to RGB (Yeah yeah, Babylon.js needs RGB)
 * @param hex - The color in hex format
 * @returns RGBColor object or null if invalid
 */
export default function hexToRgb(hex: string): RGBColor | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
} 