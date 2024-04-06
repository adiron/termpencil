import BufferSpanRenderer from './BufferSpanRenderer'
import './App.css'

function App() {
  return (
    <div id="term">
      <BufferSpanRenderer
        buffer={{
          mode: "fixed",
          bgColor: [0, 2, 0, 8, 0, 0, 0, 0, 0],
          fgColor: [1, 1, 1, 1, 1, 1, 0, 0, 0],
          charData: ["H", "e", "l", "l", "o", ",", " ", "W", "o", "r", "l", "d"],
          width: 8,
        }}
      />
    </div>
  )
}

export default App
