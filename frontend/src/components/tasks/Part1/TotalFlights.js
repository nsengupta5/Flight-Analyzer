import React, { useState, useEffect } from 'react';
import Select from '../../form/Select';
import Submit from '../../form/Submit';

function getYears() {
  const startYear = 1987;
  const endYear = 2020;
  const years = [];

  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
}

function TotalFlights() {
  const years = getYears();
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  const handleStartYearChange = (e) => {
    setStartYear(e.target.value);
  }

  const handleEndYearChange = (e) => {
    setEndYear(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('startYear:', startYear);
    console.log('endYear:', endYear);
  }

  return (
    <div class="flex flex-col justify-center items-center w-1/2 border-2 border-grey p-5">
      <h1 class="text-black text-3xl font-sans font-semibold mb-8">Total Flights</h1>
      <form onSubmit={handleSubmit} class="w-full">
        <div class="flex flex-col justify-center items-center w-full">
          <div class="flex flex-row justify-between items-center w-full">
            <Select placeholder="Select a start year" options={years} label="year" onChange={handleStartYearChange} />
            <span class="text-gray-500 text-sm">To</span>
            <Select placeholder="Select a end year" options={years} label="year" onChange={handleEndYearChange} />
          </div>
          <div class="mt-7">
            <Submit placeholder="Get Number of Years"/>
          </div>
        </div>
      </form>
    </div>
  )
}

export default TotalFlights;
