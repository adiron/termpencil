import { useState, useEffect } from "react";
import { Buffer } from "./Buffer";
import { chunkArray } from "./utils";
import styles from "./BufferSpanRenderer.module.css";

export default function BufferSpanRenderer({
    buffer,
}: {
    buffer: Buffer,
}) {
    // Uses react to render a buffer to a bunch of <span> elements, taking into
    // account background and foreground colors

    const [editing, setEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);

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
            } else if (e.key === "ArrowRight") {
                setEditIndex((i) => Math.min(i + 1, buffer.charData.length - 1));
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
}: {
    char: string,
    fg: number,
    bg: number,
    selected: boolean,
    onClick: () => void,
}) {
    return <span className={styles.cell} style={{
        color: `var(--c-${fg})`,
        backgroundColor: `var(--c-${bg})`,
        opacity: selected ? 1 : 0.5,
        outline: selected ? "2px solid white" : "none",
    }} onClick={() => onClick()}>{char}</span>;
}