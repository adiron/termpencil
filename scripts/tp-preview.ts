import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToTerminal, screenBufferFromBinary } from "../src/lib/screenbuffer.js";

function printUsage(): void {
  process.stderr.write("Usage: npm run tp:preview -- <file.tp>\n");
}

function main(): number {
  const fileArg = process.argv[2];
  if (!fileArg) {
    printUsage();
    return 1;
  }

  const filePath = resolve(process.cwd(), fileArg);

  try {
    const binary = new Uint8Array(readFileSync(filePath));
    const buffer = screenBufferFromBinary(binary);
    process.stdout.write(renderToTerminal(buffer));
    process.stdout.write("\n");
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Failed to preview ${filePath}: ${message}\n`);
    return 1;
  }
}

process.exit(main());
