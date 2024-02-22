import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home'
import DataAnalysis from './pages/DataAnalysis'
import Performance from './pages/Performance'
import Predictive from './pages/Predictive'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/data-analysis" element={<DataAnalysis />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/predictive" element={<Predictive />} />
      </Routes>
    </Router>
  );
}

export default App;
