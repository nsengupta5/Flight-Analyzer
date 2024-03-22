/**
 * @file TotalFlightsRange.js
 * @description This file implements the query that retrieves the total number of flights for a given range of years.
 * The user selects a start year and an end year from dropdown menus to retrieve the total number of flights for that range.
 */

import React, { useState } from 'react';
import axios from 'axios';
import Select from '../../form/Select';
import Submit from '../../form/Submit';
import Card from '../../ui/Card';
import Spinner from '../../ui/Spinner';

/**
 * @function getYears
 * @description This function generates an array of years from 1987 to 2020.
 * @returns {Array} An array of years from 1987 to 2020.
 */
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
  const [loading, setLoading] = useState(false);

  // Reset the state when the start year changes
  const handleStartYearChange = (e) => {
    setTotalFlights(-1)
    setStartYear(e.target.value);
  }

  // Reset the state when the end year changes
  const handleEndYearChange = (e) => {
    setTotalFlights(-1)
    setEndYear(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isValidRange(Number(startYear), Number(endYear))) {
      alert('Invalid range');
      setLoading(false);
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
      setLoading(false);
    })
    .catch((error) => {
      console.log(error);
    }
    )};

  return (
    <Card className="w-full max-w-md">
      <h1 class="mb-8 font-sans text-3xl font-semibold text-black text-center">Total Flights (Range)</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-center justify-between w-full sm:flex-row sm:max-w-2xl">
            <Select 
              placeholder="Select a start year" 
              options={years} 
              label="year" 
              onChange={handleStartYearChange} 
              className="mb-3 sm:mb-0"
            />
            <span className="my-3 text-sm text-gray-500 sm:my-0">To</span>
            <Select 
              placeholder="Select an end year" 
              options={years} 
              label="year" 
              onChange={handleEndYearChange}
            />
          </div>
          <div className="mt-7">
            <Submit placeholder="Get Number of Flights"/>
          </div>
        </div>
      </form>
      {/* Display the total number of flights only if the data is loaded */}
      {loading ? (
        <Spinner />
      ) : (
        totalFlights !== -1 && (<p className="mt-5 font-sans font-semibold text-black text-1xl">Total Flights: {totalFlights}</p>)
      )}
    </Card>
  )
}

export default TotalFlightsRange;
