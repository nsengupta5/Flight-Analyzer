/**
 * @file App.js
 * @description Main component of the application, it is responsible for routing the pages of the application.
 */

import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home'
import DataAnalysis from './pages/DataAnalysis'
import Performance from './pages/Performance'
import Advanced from './pages/Advanced'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/data-analysis" element={<DataAnalysis />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/advanced" element={<Advanced />} />
      </Routes>
    </Router>
  );
}

export default App;
