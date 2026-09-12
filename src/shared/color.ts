/**
 * The one piece of the old `theme` module that outlived it.
 *
 * Every palette value now lives in `shared/styles/tokens.css`, and the tints
 * that were derived at module-eval time are baked in there too. This is still
 * needed for `Icon`, which derives a hover tint from a colour passed as a prop.
 */

function expand(hex: string): string | null {
  if (typeof hex !== 'string' || hex[0] !== '#') return null;
  const body = hex.slice(1);
  if (body.length === 3) {
    // The original expanded 3-digit hex into a local that the RGB parser never
    // saw, so `#abc` silently produced `#NaNNaNNaN`.
    return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`;
  }
  if (body.length === 6) return hex;
  return null;
}

/**
 * Lightens (positive) or darkens (negative) a hex colour.
 * Invalid input is returned unchanged, matching the previous behaviour.
 */
export function getColorLuminance(hex: string, luminance: number): string {
  const normalised = expand(hex);
  if (!normalised) {
    console.error(`Validate hex color: ${hex} is not a valid hex color`);
    return hex;
  }

  const lum = luminance || 0;
  let color = '#';
  for (let i = 1; i < 7; i += 2) {
    const channel = parseInt(normalised[i] + normalised[i + 1], 16);
    const shifted = Math.round(
      Math.min(Math.max(0, channel + channel * lum), 255)
    ).toString(16);
    color += ('00' + shifted).substr(shifted.length);
  }
  return color;
}
