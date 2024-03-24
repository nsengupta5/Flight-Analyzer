import React from 'react';
import Navbar from '../components/ui/Navbar';
import VisualizeRoutes from '../components/tasks/Part3/VisualizeRoutes';
import FlightDensityTimeLapse from '../components/tasks/Part3/FlightDensityTimeLapse';

function Advanced() {
  return (
    <div class="flex flex-col justify-center items-center">
      <Navbar />
      <h1 class="text-black text-4xl font-sans font-semibold mb-16">Advanced Insights</h1>
      <VisualizeRoutes />
      <FlightDensityTimeLapse />
    </div>
  )
}

export default Advanced;
