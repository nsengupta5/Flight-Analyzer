import React, { useState } from 'react';
import axios from 'axios';
import Input from '../../form/Input';
import Submit from '../../form/Submit';
import Card from '../../ui/Card';
import Spinner from '../../ui/Spinner';

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
  const [loading, setLoading] = useState(false);

  const handleYearChange = (e) => {
    setYearQuery(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const yearList = getYearList(yearQuery);
    if (yearList.length === 0) {
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
    <Card>
      <h1 class="text-black text-3xl font-sans font-semibold mb-8 text-center">Total Flights (List)</h1>
      <form onSubmit={handleSubmit} class="w-full">
        <div class="flex flex-col justify-center items-center w-full">
            <Input placeholder="Enter comma separated years" onChange={handleYearChange} />
          <div class="mt-7">
            <Submit placeholder="Get Number of Flights"/>
          </div>
        </div>
      </form>
      {loading ? (
        <Spinner />
      ) : (
      totalFlights !== -1 && (<p class="text-black text-1xl font-sans font-semibold mt-5">Total Flights: {totalFlights}</p>)
      )}
    </Card>
  )
}

export default TotalFlightsList;
