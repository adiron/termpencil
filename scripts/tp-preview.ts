import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToTerminal, getRowCount } from "../src/lib/screenbuffer.js";
import { binaryToAnimatedBuffer } from "../src/lib/binary.js";

const DEFAULT_FRAME_DELAY_MS = 100;

function printUsage(): void {
  process.stderr.write("Usage: npm run tp:preview -- <file.tp>\n");
}

async function main(): Promise<number> {
  const fileArg = process.argv[2];
  if (!fileArg) {
    printUsage();
    return 1;
  }

  const filePath = resolve(process.cwd(), fileArg);

  try {
    const binary = new Uint8Array(readFileSync(filePath));
    const frames = binaryToAnimatedBuffer(binary);

    process.stdout.write(renderToTerminal(frames[0]) + "\n");

    if (frames.length === 1) {
      return 0;
    }

    process.on('SIGINT', () => {
      process.stdout.write('\x1b[0m\n');
      process.exit(0);
    });

    const rowCount = getRowCount(frames[0]);
    let frameIdx = 1;

    while (true) {
      const frame = frames[frameIdx];
      const delay = frame.delay || DEFAULT_FRAME_DELAY_MS;
      await new Promise<void>(resolve => setTimeout(resolve, delay));
      process.stdout.write(`\x1b[${rowCount}A`);
      process.stdout.write(renderToTerminal(frame) + "\n");
      frameIdx = (frameIdx + 1) % frames.length;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Failed to preview ${filePath}: ${message}\n`);
    return 1;
  }
}

main().then(code => process.exit(code));
