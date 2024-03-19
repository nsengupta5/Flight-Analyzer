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
    <div className="flex flex-col items-center justify-center"> {/* Ensure full screen height */}
      <Navbar />
      <h1 className="mb-16 font-sans text-4xl font-semibold text-black">Data Analysis</h1>
      <div className="items-start w-full mb-6 max-w-8xl grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-y-6 place-items-center"> {/* Center grid items */}
        <TotalFlightsYear />
        <TotalFlightsRange />
        <TotalFLightsList />
        <WorstPerformingAirlines /> {/* Include in grid */}
        <TopCancellationReason />
        <MostPunctualAirports />
      </div>
      <FlightTimeliness />
    </div>
  );
}

export default DataAnalysis;
