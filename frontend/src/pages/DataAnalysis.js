import React from 'react';
import TotalFlightsYear from '../components/tasks/Part1/TotalFlightsYear';
import TotalFlightsRange from '../components/tasks/Part1/TotalFlightsRange';
import TotalFLightsList from '../components/tasks/Part1/TotalFlightsList';
import FlightTimeliness from '../components/tasks/Part1/FlightTimeliness';
import TopCancellationReason from '../components/tasks/Part1/TopCancellationReason';
import MostPunctualAirports from '../components/tasks/Part1/MostPunctualAirports';
import WorstPerformingAirlines from '../components/tasks/Part1/WorstPerformingAirlines';
import Navbar from '../components/ui/Navbar';

function DataAnalysis() {
  return (
    <div class="flex flex-col justify-center items-center">
      <Navbar />
      <h1 class="text-black
        text-5xl font-sans font-semibold mb-16">Data Analysis</h1>
        <TotalFlightsYear />
        <br />
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
