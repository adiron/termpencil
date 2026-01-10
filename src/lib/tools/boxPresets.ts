import type { Color } from "../screenbuffer";
import type { TupLen } from "../types";

export const FG = Symbol("fg");
export const BG = Symbol("bg");

export type Fill<T> = {
  codepoint: number | null,
  fg: Color | undefined | T;
  bg: Color | undefined | T;
} | null

export type FrameOptions<T = undefined> = FrameOptionsAll<T> | FrameOptionsSpecific<T>;

export interface FrameOptionsAll<T = undefined> {
  all: Fill<T>;
}

export interface FrameOptionsSpecific<T = undefined> {
  edge: TupLen<4, Fill<T>> | Fill<T>;
  corner: TupLen<4, Fill<T>> | Fill<T>;
}

export interface FrameOptionsExpanded<T = undefined> {
  edge: TupLen<4, Fill<T>>;
  corner: TupLen<4, Fill<T>>;
}

export interface BoxPreset<T = undefined> {
  color: Fill<T>;
  frame?: FrameOptions<T>;
  shadow?: {
    offset: [number, number];
    color: Fill<T>;
  }
}

export const BOX_PRESETS: BoxPreset<Symbol>[] = [
  // Just a fill
  {
    color: {
      codepoint: null,
      fg: FG,
      bg: BG,
    }
  },
  // +--+
  // |  |
  // +--+
  {
    color: {
      codepoint: null,
      fg: FG,
      bg: BG,
    },

    frame: {
      edge: [
        {
          codepoint: "-".codePointAt(0) as number,
          fg: FG,
          bg: BG,
        },
        {
          codepoint: "|".codePointAt(0) as number,
          fg: FG,
          bg: BG,
        },
        {
          codepoint: "-".codePointAt(0) as number,
          fg: FG,
          bg: BG,
        },
        {
          codepoint: "|".codePointAt(0) as number,
          fg: FG,
          bg: BG,
        },
      ],

      corner: {
        codepoint: "+".codePointAt(0) as number,
        fg: FG,
        bg: BG,
      },
    }
  },
  // +--+
  // |  |
  // +--+
  // + shadow
  {
    color: {
      codepoint: null,
      fg: FG,
      bg: BG,
    },

    shadow: {
      offset: [1,1],
      color: {
        codepoint: null,
        fg: undefined,
        bg: undefined,
      }
    },

    frame: {
      edge: [
        {
          codepoint: "-".codePointAt(0) as number,
          fg: FG,
          bg: BG,
        },
        {
          codepoint: "|".codePointAt(0) as number,
          fg: FG,
          bg: BG,
        },
        {
          codepoint: "-".codePointAt(0) as number,
          fg: FG,
          bg: BG,
        },
        {
          codepoint: "|".codePointAt(0) as number,
          fg: FG,
          bg: BG,
        },
      ],

      corner: {
        codepoint: "+".codePointAt(0) as number,
        fg: FG,
        bg: BG,
      },
    }
  }
];

