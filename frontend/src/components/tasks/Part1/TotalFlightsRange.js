import React, { useState } from 'react';
import axios from 'axios';
import Select from '../../form/Select';
import Submit from '../../form/Submit';
import Card from '../../ui/Card';

function getYears() {
  const startYear = 1987;
  const endYear = 2020;
  const years = [];

  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
}

function isValidRange(startYear, endYear) {
  return startYear <= endYear;
}

function TotalFlightsRange() {
  const years = getYears();
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [totalFlights, setTotalFlights] = useState(-1);

  const handleStartYearChange = (e) => {
    setTotalFlights(-1)
    setStartYear(e.target.value);
  }

  const handleEndYearChange = (e) => {
    setTotalFlights(-1)
    setEndYear(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValidRange(Number(startYear), Number(endYear))) {
      alert('Invalid range');
      return;
    }

    // Use axios to send the data to the backend
    axios.post('/api/total-flights-range', {
      // Cast the years to integers
      start_year: Number(startYear),
      end_year: Number(endYear)
    })
    .then((response) => {
      setTotalFlights(response.data.total_flights);
    })
    .catch((error) => {
      console.log(error);
    }
    )};

  return (
    <Card>
      <h1 class="text-black text-3xl font-sans font-semibold mb-8">Total Flights (Range)</h1>
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
      {totalFlights !== -1 && <p class="text-black text-1xl font-sans font-semibold mt-5">Total Flights: {totalFlights}</p>}
    </Card>
  )
}

export default TotalFlightsRange;
