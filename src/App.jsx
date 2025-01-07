import React from "react"
import {BrowserRouter as Router, Routes, Route } from "react-router-dom"
import {Home} from './components/Home'
import { Berwick } from "./components/Berwick"
import { Cranbourne } from "./components/Cranbourne"

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/berwick" element={<Berwick />} />
        <Route path="/cranbourne" element={<Cranbourne />} />
      </Routes>
    </Router>
    </>
  )
}

export default App;
