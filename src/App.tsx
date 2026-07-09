import './App.css'
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom'
import Home from "./pages/Home";
import Item from "./pages/Item";
import Sidebar from './components/Sidebar';
import Items from './pages/Items';
import NotFound from './components/NotFound';
import Machines from './pages/Mashines';
import Machine from './pages/Machine';

function Category() {
  return (
    <div className="layout">
      <Sidebar />

      <main>
        <Outlet />  
      </main>      
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Category />}>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/item/:id" element={<Item />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/machine/:id" element={<Machine />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
