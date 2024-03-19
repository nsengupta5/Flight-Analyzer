import React from 'react';
import Navbar from '../components/ui/Navbar';
import AirportPerformance from '../components/tasks/Part2/AirportPerformance';

function Performance() {
  return (
    <div class="flex flex-col justify-center items-center">
      <Navbar />
      <h1 class="text-black
        text-5xl font-sans font-semibold mb-16">Performance Analysis</h1>
      <AirportPerformance />
    </div>
  )
}

export default Performance;
