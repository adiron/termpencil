export type Buffer = {
    mode: "fixed" | "inline",
    bgColor: number[], // ANSI Escape sequence for background color
    fgColor: number[], // ANSI Escape sequence for foreground color
    charData: string[],
    width?: number,
} & ( { mode: "fixed", width: number } | { mode: "inline" } );

export function bufferAsFlatString(buffer: Buffer): string {
    if (buffer.mode === "inline") {
        return buffer.charData.join("");
    } else {
        return buffer.charData.join("").replace(new RegExp(`.{${buffer.width}}`, "g"), "$&\n");
    }
}