import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Cube from './Cube'
import CursorChat from './CursorChat'
import Home from './Home'

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/cube" element={<Cube />}></Route>
          <Route path="/chat" element={<CursorChat />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
