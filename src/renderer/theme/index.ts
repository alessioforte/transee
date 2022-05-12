const theme = {
  colors: {
    frame: '#1A1A1A',
    primary: '#0077B5',
    secondary: '#86C5E0',
    action: '#F7AC91',
    active: '#1A1A1A',
    selected: '#008080',
    hover: '#1A1A1A',
    success: '#00FA9A',
    warning: '#FFA500',
    danger: '#B22222',
    error: '#DC143C',
    info: '#2182BD',
    light: '#FFFFFF',
    dark: '#1A1A1A',
    groundzero: '#1A1A1A',
    background: '#2A2A2A',
    flatground: '#373737',
    foreground: '#555555',
    upperground: '#707070',
    higherground: '#303030',
    idle: '#999999',
    disabled: '#555555',
    focus: '#61dafb',
    text: {
      main: '#FFFFFF',
      primary: '#0077B5',
      secondary: '#86C5E0',
      soft: '#AAAAAA',
      low: '#999999',
      disabled: '#555555',
      idle: '#444444',
      active: '#FFFFFF',
      selected: '#0077B5',
      hover: '#FFFFFF',
      success: '#00FA9A',
      warning: '#FFA500',
      danger: '#B22222',
      error: '#DC143C',
      info: '#0077B5',
    }
  },
  shadow: '0px 1px 5px 1px rgba(0, 0, 0, 0.2)',
};

export function getColorLuminance(hex: string, luminance: number): string {
  const valid: boolean = validateHex(hex);
  let color = hex;
  if (valid) {
    const rgb = colorHexToRgb(hex);
    color = '#';
    luminance = luminance || 0;
    rgb.forEach(c => {
      let x = Math.round(Math.min(Math.max(0, c + c * luminance), 255)).toString(
        16
      );
      color += ('00' + x).substr(x.length);
    });
  }
  return color;
}

function validateHex(color: string): boolean {
  if (typeof color !== 'string') {
    console.error(`Validate hex color: ${color} is not a string`);
    return false;
  }
  if (color[0] !== '#') {
    console.error(`Validate hex color: ${color} is not a valid hex color`);
    return false;
  }
  color = color.replace('#', '');
  if (color.length < 3) {
    console.error(`Validate hex color: #${color} is not a valid hex color`);
    return false;
  }
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  return true;
}

function colorHexToRgb(hex: string): [number, number, number] {
  const r: number = parseInt(hex[1] + hex[2], 16);
  const g: number = parseInt(hex[3] + hex[4], 16);
  const b: number = parseInt(hex[5] + hex[6], 16);
  return [r, g, b];
}

export default theme;
