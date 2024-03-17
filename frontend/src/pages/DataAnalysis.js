import React from 'react';
import TotalFlightsRange from '../components/tasks/Part1/TotalFlightsRange';
import TotalFLightsList from '../components/tasks/Part1/TotalFlightsList';
import FlightTimeliness from '../components/tasks/Part1/FlightTimeliness';
import TopCancellationReason from '../components/tasks/Part1/TopCancellationReason';
import MostPunctualAirports from '../components/tasks/Part1/MostPunctualAirports';
import WorstPerformingAirlines from '../components/tasks/Part1/WorstPerformingAirlines';

function DataAnalysis() {
  return (
    <div class="flex flex-col justify-center items-center">
      <h1 class="text-black
        text-5xl font-sans font-semibold mb-16">Data Analysis</h1>
        <TotalFlightsRange />
        <br />
        <TotalFLightsList />
        <br />
        <FlightTimeliness />
        <br />
        <TopCancellationReason />
        <br />
        <MostPunctualAirports />
        <br />
        <WorstPerformingAirlines />
    </div>
  )
}

export default DataAnalysis;
