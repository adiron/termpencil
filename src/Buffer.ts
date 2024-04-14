const DEFAULT_FG_COLOR = 0;
const DEFAULT_BG_COLOR = 0;

export interface IChar {
    char: string,
    fgColor: number,
    bgColor: number,
}

export type BufferData = {
    charData: string[],
    fgColor: number[],
    bgColor: number[],
    mode: "fixed" | "inline",
    width?: number,
}

class Buffer {
    mode: "fixed" | "inline";
    width?: number;

    private charData: string[] = [];
    private fgColor: number[] = [];
    private bgColor: number[] = [];

    constructor(options: {
        mode: "fixed" | "inline",
        width?: number,
    } | { data: BufferData }) {
        if ("data" in options) {
            this.charData = options.data.charData;
            this.fgColor = options.data.fgColor;
            this.bgColor = options.data.bgColor;
            this.mode = options.data.mode;
            this.width = options.data.width;
            return;
        }

        this.mode = options.mode;
        if (options.mode === "fixed") {
            this.width = options.width;
        }

    }

    setWidth(width: number) {
        if (this.mode !== "fixed") {
            throw new Error("Cannot set width on inline buffer");
        }
        this.width = width;
    }

    euqalize() {
        if (
            this.charData.length !== this.fgColor.length ||
            this.charData.length !== this.bgColor.length
        ) {
            // Insert empty data to make all arrays the same length
            const length = Math.max(
                this.charData.length,
                this.fgColor.length,
                this.bgColor.length,
            );

            this.charData = this.charData.concat(Array(length - this.charData.length).fill(" "));
            this.fgColor = this.fgColor.concat(Array(length - this.fgColor.length).fill(DEFAULT_FG_COLOR));
            this.bgColor = this.bgColor.concat(Array(length - this.bgColor.length).fill(DEFAULT_BG_COLOR));
        }
    }

    appendChar(char: IChar) {
        this.euqalize();
        this.charData.push(char.char);
        this.fgColor.push(char.fgColor);
        this.bgColor.push(char.bgColor);
    }

    appendRange(chars: IChar[]) {
        this.euqalize();
        this.charData = this.charData.concat(chars.map((char) => char.char));
        this.fgColor = this.fgColor.concat(chars.map((char) => char.fgColor));
        this.bgColor = this.bgColor.concat(chars.map((char) => char.bgColor));
    }

    appendString(str: string, fgColor: number, bgColor: number) {
        this.euqalize();
        this.charData = this.charData.concat(str.split(""));
        this.fgColor = this.fgColor.concat(Array(str.length).fill(fgColor));
        this.bgColor = this.bgColor.concat(Array(str.length).fill(bgColor));
    }

    setRange(start: number, chars: IChar[]) {
        this.euqalize();
        for (let i = 0; i < chars.length; i++) {
            this.charData[start + i] = chars[i].char;
            this.fgColor[start + i] = chars[i].fgColor;
            this.bgColor[start + i] = chars[i].bgColor;
        }
    }

    setChar(index: number, char: IChar) {
        this.setRange(index, [char]);
    }

    toEscapeSequence(): string {
        let escapeSequence = "";
        let currentFgColor = -1;
        let currentBgColor = -1;
        for (let i = 0; i < this.charData.length; i++) {
            if (this.fgColor[i] !== currentFgColor) {
                const fgColor = this.fgColor[i];
                if (typeof fgColor === "number") {
                    escapeSequence += `\x1b[38;5;${this.fgColor[i]}m`;
                    currentFgColor = this.fgColor[i];
                }
            }
            if (this.bgColor[i] !== currentBgColor) {
                const bgColor = this.bgColor[i];
                if (typeof bgColor === "number") {
                    escapeSequence += `\x1b[48;5;${this.bgColor[i]}m`;
                    currentBgColor = this.bgColor[i];
                }
            }
            escapeSequence += this.charData[i];
        }

        return escapeSequence;
    }

    pickle(): BufferData {
        return {
            charData: this.charData,
            fgColor: this.fgColor,
            bgColor: this.bgColor,
            mode: this.mode,
            width: this.width,
        }
    }

    static unpickle(data: BufferData): Buffer {
        const buffer = new Buffer({ data: data });
        return buffer;
    }

    static fromString(str: string): Buffer {
        const buffer = new Buffer({ mode: "inline", width: undefined });
        buffer.appendString(str, DEFAULT_BG_COLOR, DEFAULT_FG_COLOR);
        return buffer;
    }

}

export default Buffer;