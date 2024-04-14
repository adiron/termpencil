import { useState } from "react";
import XTermRenderer from "./XTermRenderer";
import Buffer, { BufferData } from "./Buffer";

const DEFAULT_BUFFER_DATA: BufferData = (() => {
    const text = "Hello, World!";
    return {
        charData: text.split(""),
        fgColor: Array(text.length).fill(7),
        bgColor: Array(text.length).fill(16),
        mode: "inline",
    }
})()

function PencilBufferController({
    initData
}: {
    initData?: BufferData,
}) {
    const [buffer, setBuffer] = useState<IBuffer>(
        new Buffer(initData || { data: DEFAULT_BUFFER_DATA })
    );

    const [mode, setMode] = useState<"insert" | "normal">("insert");
    const [cursorPosition, setCursorPosition] = useState([1, 1] as [number, number]);

    return (
        <div>
            <XTermRenderer
                data={buffer.toEscapeSequence()}
                cursorPosition={cursorPosition}
            />
            MODE: {mode}
        </div>
    );
}

export default PencilBufferController;