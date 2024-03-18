import React, { useState } from 'react';
import axios from 'axios';
import Input from '../../form/Input';
import Submit from '../../form/Submit';
import Card from '../../ui/Card';

function getYearList(yearQuery) {
  const minYear = 1987;
  const maxYear = 2020;
  const years = yearQuery.split(',').map(year => Number(year.trim()));
  for (let year of years) {
    if (year < minYear || year > maxYear) {
      return [];
    }
  }
  return years;
}

function TotalFlightsList() {
  const [yearQuery, setYearQuery] = useState('');
  const [totalFlights, setTotalFlights] = useState(-1);

  const handleYearChange = (e) => {
    setYearQuery(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const yearList = getYearList(yearQuery);
    if (yearList.length === 0) {
      alert('Invalid year range');
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
    }
    )};

  return (
    <Card>
      <h1 class="text-black text-3xl font-sans font-semibold mb-8">Total Flights (List)</h1>
      <form onSubmit={handleSubmit} class="w-full">
        <div class="flex flex-col justify-center items-center w-full">
            <Input placeholder="Enter comma separated years" onChange={handleYearChange} />
          <div class="mt-7">
            <Submit placeholder="Get Number of Years"/>
          </div>
        </div>
      </form>
      {totalFlights !== -1 && <p class="text-black text-1xl font-sans font-semibold mt-5">Total Flights: {totalFlights}</p>}
    </Card>
  )
}

export default TotalFlightsList;
