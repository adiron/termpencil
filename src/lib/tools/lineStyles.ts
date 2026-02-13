export interface LineStyleRange {
  from: number;
  to: number;
  codepoint: number;
}

export interface LineStyle {
  id: string;
  name: string;
  ranges: LineStyleRange[];
}

const ANGLE_RANGES_8_WAY: Array<[number, number]> = [
  [337.5, 360],
  [0, 22.5],
  [22.5, 67.5],
  [67.5, 112.5],
  [112.5, 157.5],
  [157.5, 202.5],
  [202.5, 247.5],
  [247.5, 292.5],
  [292.5, 337.5],
];

function makeRanges(chars: [number, number, number, number]): LineStyleRange[] {
  const [horiz, slash, vert, backslash] = chars;

  return [
    { from: ANGLE_RANGES_8_WAY[0][0], to: ANGLE_RANGES_8_WAY[0][1], codepoint: horiz },
    { from: ANGLE_RANGES_8_WAY[1][0], to: ANGLE_RANGES_8_WAY[1][1], codepoint: horiz },
    { from: ANGLE_RANGES_8_WAY[2][0], to: ANGLE_RANGES_8_WAY[2][1], codepoint: slash },
    { from: ANGLE_RANGES_8_WAY[3][0], to: ANGLE_RANGES_8_WAY[3][1], codepoint: vert },
    { from: ANGLE_RANGES_8_WAY[4][0], to: ANGLE_RANGES_8_WAY[4][1], codepoint: backslash },
    { from: ANGLE_RANGES_8_WAY[5][0], to: ANGLE_RANGES_8_WAY[5][1], codepoint: horiz },
    { from: ANGLE_RANGES_8_WAY[6][0], to: ANGLE_RANGES_8_WAY[6][1], codepoint: slash },
    { from: ANGLE_RANGES_8_WAY[7][0], to: ANGLE_RANGES_8_WAY[7][1], codepoint: vert },
    { from: ANGLE_RANGES_8_WAY[8][0], to: ANGLE_RANGES_8_WAY[8][1], codepoint: backslash },
  ];
}

export const LINE_STYLES: LineStyle[] = [
  {
    id: 'ascii',
    name: 'ASCII',
    ranges: makeRanges([45, 47, 124, 92]),
  },
  {
    id: 'braille',
    name: 'Braille',
    ranges: makeRanges([0x2812, 0x281C, 0x2807, 0x2831]),
  },
  {
    id: 'block',
    name: 'Block',
    ranges: makeRanges([0x2581, 0x259E, 0x258F, 0x259A]),
  },
];
