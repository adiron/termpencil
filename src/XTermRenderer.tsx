import { Terminal } from '@xterm/xterm';
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef, useState } from 'react';

function XTermRenderer({
    data,
    cursorPosition,
}: {
    data: string,
    cursorPosition: [number, number],
}) {
    const xterm = useRef<HTMLDivElement>(null);
    const [terminalObject, setTerminalObject] = useState<Terminal | null>(null);

    useEffect(() => {
        const term = new Terminal();
        setTerminalObject(term);
        if (!xterm.current) {
            console.log("no xterm")
            return;
        }
        term.open(xterm.current);
        return () => {
            term.dispose();
        }
    }, [xterm]);

    useEffect(() => {
        if (!terminalObject) {
            return;
        }
        terminalObject.clear();
        terminalObject.write(data);
        // Set cursor position by using the CSI escape sequence
        terminalObject.write(`\x1b[${cursorPosition[0]};${cursorPosition[1]}H`);
    }, [cursorPosition, data, terminalObject]);

    return (
        <div id="xterm" ref={xterm}>
        </div>
    )
}

export default XTermRenderer