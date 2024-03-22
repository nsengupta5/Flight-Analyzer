/**
 * @file TotalFlightsList.js
 * @description This file implements the query that retrieves the total number of flights for a list of years.
 * The user enters a comma-separated list of years to retrieve the total number of flights for those years.
 */
import React, { useState } from 'react';
import axios from 'axios';
import Input from '../../form/Input';
import Submit from '../../form/Submit';
import Card from '../../ui/Card';
import Spinner from '../../ui/Spinner';

/**
 * @function getYearList
 * @description This function generates an array of years from the user input.
 * @param {String} yearQuery - A comma-separated list of years.
 * @returns {Array} An array of years from the user input.
 */
function getYearList(yearQuery) {
  const minYear = 1987;
  const maxYear = 2020;
  const years = yearQuery.split(',').map(year => Number(year.trim()));
  for (let year of years) {
    // Check if the year is within the valid range
    if (year < minYear || year > maxYear) {
      return [];
    }
  }
  return years;
}

function TotalFlightsList() {
  const [yearQuery, setYearQuery] = useState('');
  const [totalFlights, setTotalFlights] = useState(-1);
  const [loading, setLoading] = useState(false);

  const handleYearChange = (e) => {
    setYearQuery(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const yearList = getYearList(yearQuery);
    if (yearList.length === 0) {
      // Alert the user if the year range is invalid
      alert('Invalid year range');
      setLoading(false);
      return;
    }

    // Use axios to send the data to the backend
    axios.post('/api/total-flights-list', {
      // Cast the years to integers
      years: yearList
    })
    .then((response) => {
      setTotalFlights(response.data.total_flights);
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      setLoading(false);
    }
    )};

  return (
    <Card className="w-5/6 max-w-md">
      <h1 class="text-black text-3xl font-sans font-semibold mb-8 text-center">Total Flights (List)</h1>
      <form onSubmit={handleSubmit} class="w-full">
        <div class="flex flex-col justify-center items-center w-full">
            <Input placeholder="Enter comma separated years" onChange={handleYearChange} />
          <div class="mt-7">
            <Submit placeholder="Get Number of Flights"/>
          </div>
        </div>
      </form>
      {/* Display the total number of flights only if the data is loaded */}
      {loading ? (
        <Spinner />
      ) : (
      totalFlights !== -1 && (<p class="text-black text-1xl font-sans font-semibold mt-5">Total Flights: {totalFlights}</p>)
      )}
    </Card>
  )
}

export default TotalFlightsList;
