import { Terminal } from '@xterm/xterm';
import "@xterm/xterm/css/xterm.css";
import { Buffer, bufferToEscapeSequence } from './Buffer';
import { useEffect, useRef, useState } from 'react';

function XTermRenderer({
    buffer,
}: {
    buffer: Buffer,
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
        terminalObject.write(bufferToEscapeSequence(buffer));
    }, [buffer, terminalObject]);

    return (
        <div id="xterm" ref={xterm}>
        </div>
    )
}

export default XTermRenderer