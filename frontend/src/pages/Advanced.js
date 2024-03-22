import React from 'react';
import Navbar from '../components/ui/Navbar';
import Predictive from '../components/tasks/Part3/Predictive';

function Advanced() {
  return (
    <div class="flex flex-col justify-center items-center">
      <Navbar />
      <h1 class="text-black text-4xl font-sans font-semibold mb-16">Advanced Insights</h1>
      <Predictive />
    </div>
  )
}

export default Advanced;
