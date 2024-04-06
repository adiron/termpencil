import { useState, useEffect, useRef } from "react";
import { Buffer, extendBuffer, setBufferChar } from "./Buffer";
import { chunkArray } from "./utils";
import styles from "./BufferSpanRenderer.module.css";

export default function BufferSpanRenderer({
    buffer,
    onChange,
}: {
    buffer: Buffer,
    onChange: (buffer: Buffer) => void,
}) {
    // Uses react to render a buffer to a bunch of <span> elements, taking into
    // account background and foreground colors

    const [editing, setEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);

    const advance = () => {
        if (!editing) { return }
        if (editIndex >= buffer.charData.length - 1) {
            onChange(
                extendBuffer(buffer, editIndex - buffer.charData.length)
            )
        }
        if (editIndex < buffer.charData.length - 1) {
            setEditIndex(editIndex + 1);
        }
    }

    useEffect(() => {
        if (!editing) {
            setEditIndex(-1);
        }
    }, [editing]);

    // Bind arrow keys to editIndex
    useEffect(() => {
        if (!editing) {
            return;
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                setEditIndex((i) => Math.max(i - 1, 0));
                e.preventDefault();
            } else if (e.key === "ArrowRight") {
                setEditIndex((i) => Math.min(i + 1, buffer.charData.length - 1));
                e.preventDefault();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [editing, buffer.charData.length]);

    const cells = buffer.charData.map((char, i) => {
        const fg = buffer.fgColor[i];
        const bg = buffer.bgColor[i];

        if (!editing) {
            return <StaticCell
                key={i}
                char={char}
                fg={fg}
                bg={bg}
            />;
        }

        return <EditableCell
            key={i}
            char={char}
            fg={fg}
            bg={bg}
            selected={editIndex === i}
            onClick={() => {
                setEditIndex(i);
            }}
            onChange={(value) => {
                // buffer.charData[i] = value;
                onChange(
                    setBufferChar(buffer, i, value, fg, bg)
                )
                advance();
            }}
        />;

    });

    // Chunk the array into rows if width is defined
    const rows = buffer.width ? chunkArray(cells, buffer.width) : [cells];

    return <div>
        <button onClick={() => setEditing(!editing)}>
            {editing ? "Stop editing" : "Edit"}
        </button>
        <div className={styles.term}>
            {rows.map((row, i) => <div key={i}>{row}</div>)}
        </div>
    </div>
}

function StaticCell({
    char,
    fg,
    bg,
}: {
    char: string,
    fg: number,
    bg: number,
}) {
    return <span className={styles.cell} style={{
        color: `var(--c-${fg})`,
        backgroundColor: `var(--c-${bg})`,
    }}>{char}</span>;
}

function EditableCell({
    char,
    fg,
    bg,
    selected,
    onClick,
    onChange,
}: {
    char: string,
    fg: number,
    bg: number,
    selected: boolean,
    onClick: () => void,
    onChange: (value: string) => void,
}) {
    // Focus on the internal span when selected
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        if (selected && ref.current) {
            window.getSelection()?.selectAllChildren(ref.current);
        }
    }, [selected]);

    // Detect changes using MutationObserver
    useEffect(() => {
        if (!selected || !ref.current) {
            return;
        }
        const observer = new MutationObserver(() => {
            // Handle changes here
            const text = ref.current?.innerText;
            if (text) {
                onChange(ref.current?.innerText)
            }
        });
        const config = { characterData: true, subtree: true };
        observer.observe(ref.current, config);
        return () => {
            observer.disconnect();
        };
    }, [selected, onChange]);

    return <span
        className={styles.cell}
        style={{
            color: `var(--c-${fg})`,
            backgroundColor: `var(--c-${bg})`,
            opacity: selected ? 1 : 0.5,
            outline: selected ? "2px solid white" : "none",
        }}
        onClick={() => onClick()}
        contentEditable={true}
        suppressContentEditableWarning={true}
        ref={ref}
    >{char}</span>;
}