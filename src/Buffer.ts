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

export function extendBuffer(buffer: Buffer, length: number): Buffer {
    const lastColor = buffer.fgColor[buffer.fgColor.length - 1];
    const lastBgColor = buffer.bgColor[buffer.bgColor.length - 1];

    return {
        ...buffer,
        bgColor: buffer.bgColor.concat(Array(length).fill(lastBgColor)),
        fgColor: buffer.fgColor.concat(Array(length).fill(lastColor)),
        charData: buffer.charData.concat(Array(length).fill(" ")),
    };
}

export function setBufferRange(
    buffer: Buffer,
    start: number,
    charData: string[],
    fgColor: number[],
    bgColor: number[],
): Buffer {
    if (charData.length !== fgColor.length || charData.length !== bgColor.length) {
        throw new Error("charData, fgColor, and bgColor must be the same length");
    }
    const newBuffer = { ...buffer };
    for (let i = 0; i < charData.length; i++) {
        newBuffer.charData[start + i] = charData[i];
        newBuffer.fgColor[start + i] = fgColor[i];
        newBuffer.bgColor[start + i] = bgColor[i];
    }
    return newBuffer;
}

export function setBufferChar(
    buffer: Buffer,
    index: number,
    char: string,
    fgColor: number,
    bgColor: number,
): Buffer {
    return setBufferRange(buffer, index, [char], [fgColor], [bgColor]);
}