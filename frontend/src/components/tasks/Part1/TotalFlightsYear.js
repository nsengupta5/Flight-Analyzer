/**
 * @file TotalFlightsYear.js
 * @description This file implements the query that retrieves the total number of flights for a given year.
 * The user selects a year from a dropdown menu to retrieve the total number of flights for that year.
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

function TotalFlightsYear() {
  const years = getYears();
  const [year, setYear] = useState('');
  const [totalFlights, setTotalFlights] = useState(-1);
  const [loading, setLoading] = useState(false);

  const handleYearChange = (e) => {
    setYear(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Use axios to send the data to the backend
    axios.post('/api/total-flights-year', {
      // Cast the years to integers
      year: Number(year)
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
    <Card className="w-5/6 max-w-md">
      <h1 class="text-black text-3xl font-sans font-semibold mb-8 text-center">Total Flights (Year)</h1>
      <form onSubmit={handleSubmit} class="w-full">
        <div class="flex flex-col justify-center items-center w-full">
          <div>
            <Select placeholder="Select a year" options={years} label="year" onChange={handleYearChange} />
          </div>
          <div class="mt-7">
            <Submit placeholder="Get Number of Flights"/>
          </div>
        </div>
      </form>
      {/* Display the total number of flights only if the data is loaded */}
      {loading ? (
        <Spinner />
      ) : totalFlights !== -1 ? (<p class="text-black text-1xl font-sans font-semibold mt-5">Total Flights: {totalFlights}</p>) : null}
    </Card>
  )
}

export default TotalFlightsYear;
