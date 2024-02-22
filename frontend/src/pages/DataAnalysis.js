import React from 'react';
import TotalFlightsRange from '../components/tasks/Part1/TotalFlightsRange';
import TotalFLightsList from '../components/tasks/Part1/TotalFlightsList';


function DataAnalysis() {
  return (
    <div class="flex flex-col justify-center items-center h-screen">
      <h1 class="text-black
        text-5xl font-sans font-semibold mb-16">Data Analysis</h1>
        <TotalFlightsRange />
        <br />
        <TotalFLightsList />
    </div>
  )
}

export default DataAnalysis;
