import React from "react"
import {BrowserRouter as Router, Routes, Route } from "react-router-dom"
import {Home} from './components/Home'
import { Berwick } from "./components/Berwick"
import { Cranbourne } from "./components/Cranbourne"
import { Logic } from "./components/Logic"
import { Slide } from "./components/Reel/Slide"
import { SubBerwick } from "./components/SubBerwick"
import { Subcranbourne } from "./components/Subcranbourne"
import timesLogo from './assets/pictures/timesLogo.png'

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/berwick" element={<Berwick />} />
        <Route path="/cranbourne" element={<Cranbourne />} />
        <Route path="/" element={<SubBerwick />} />
        <Route path="/image" element={<Logic type="Image" logo={timesLogo} defaultText="TIMES BERWICK" />} />
        <Route path="/" element={<Subcranbourne />} />
        <Route path="/reels" element={<Slide />} />
      </Routes>
    </Router>
    </>
  )
}

export default App;
