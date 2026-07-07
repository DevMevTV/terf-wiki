import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from "./pages/Home";
import Item from "./pages/Item";

function App() {
  return (
    <BrowserRouter basename="/terf-wiki">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<Item />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
