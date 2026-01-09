import type { Color } from "../screenbuffer";
import type { BoxPreset } from "./BoxTool.svelte";

export const FG = Symbol("fg");
export const BG = Symbol("bg");

export function makeResolver(
  fg: Color | undefined,
  bg: Color | undefined,
) {
  const walk = (v: unknown): unknown => {
    // Replace symbols
    if (typeof v === "symbol") {
      if (v === FG) return fg;
      if (v === BG) return bg;
      throw new Error(`Unknown symbol placeholder: ${String(v)}`);
    }

    if (v === null || v === undefined) return v;
    if (typeof v !== "object") return v;

    if (Array.isArray(v)) return v.map(walk);

    // Plain object
    const out: Record<PropertyKey, unknown> = {};
    for (const k of Reflect.ownKeys(v)) {
      out[k] = walk((v as any)[k]);
    }
    return out;
  };

  return (preset: BoxPreset<Symbol>): BoxPreset<undefined> =>
    walk(preset) as BoxPreset<undefined>
}

const BASE_PRESETS: BoxPreset<Symbol>[] = [
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

export function getPresets(fg: Color | undefined, bg: Color | undefined) {
  const resolver = makeResolver(fg, bg);
  return BASE_PRESETS.map(resolver)
}
