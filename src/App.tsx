import './App.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Home from "./pages/Home";
import Item from "./pages/Item";

function App() {
  return (
    <HashRouter basename="/terf-wiki">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<Item />} />
      </Routes>
    </HashRouter>
  )
}

export default App
