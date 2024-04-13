// import BufferSpanRenderer from './BufferSpanRenderer'
import './App.css'
import { useState } from 'react';
import { Buffer } from './Buffer';
import XTermRenderer from './XTermRenderer';

function App() {
  const [buffer, setBuffer] = useState<Buffer>({
    mode: "fixed",
    bgColor: [0, 2, 0, 8, 0, 0, 2, 2, 2, 3],
    fgColor: [1, 1, 1, 1, 1, 1, 0, 8, 2],
    charData: ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d"],
    width: 8,
  });
  return (
    <div id="term">
      {/* <BufferSpanRenderer
        buffer={buffer}
        onChange={(newBuffer) => setBuffer(newBuffer)}
      /> */}
      <XTermRenderer buffer={buffer} />
    </div>
  )
}

export default App
