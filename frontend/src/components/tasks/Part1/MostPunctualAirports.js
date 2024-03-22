/**
 * @file MostPunctualAirports.js
 * @description This file implements the query that retrieves the most punctual airports for a given year.
 * The user selects a year from a dropdown menu to retrieve the most punctual airports for that year.
 */

import React, { useState } from 'react';
import axios from 'axios';
import Select from '../../form/Select';
import Submit from '../../form/Submit';
import Card from '../../ui/Card';
import Spinner from '../../ui/Spinner';

function MostPunctualAirports() {
  const years = [1987, 1997, 2007, 2017];
  const [year, setYear] = useState('');
  const [puncAirports, setPuncAirports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset the state when the year changes
  const handleYearChange = (e) => {
    setPuncAirports([]);
    setYear(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Use axios to send the data to the backend
    axios.post('/api/most-punctual-airports', {
      // Cast the years to integers
      year: Number(year)
    })
      .then((response) => {
        setPuncAirports(response.data.most_punctual_airports);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      }
      )};

  return (
    <Card className="w-5/6 max-w-md">
      <h1 class="text-black text-3xl font-sans font-semibold mb-8 text-center">Most Punctual Airports</h1>
      <form onSubmit={handleSubmit} class="w-full">
        <div class="flex flex-col justify-center items-center w-full">
          <div>
            <Select placeholder="Select a year" options={years} label="year" onChange={handleYearChange} />
          </div>
          <div class="mt-7">
            <Submit placeholder="Get Most Punctual Airports"/>
          </div>
        </div>
      </form>
      {/* Display the pie chart only if the data is loaded */}
      {loading ? (
        <Spinner />
      ) :
      <>
        {/** Display the most punctual airports only if the there are any */}
        {puncAirports.length.length > 0 && year && ( 
          <p class="text-black text-1xl font-sans font-semibold mt-5">Most Punctual Airports in {year}:</p> )}
        {puncAirports.map((airport, index) => (
          <p key={index} class="text-black text-sm font-sans font-md mt-3">{(index + 1)}) {airport}</p>
        ))}
      </>
      }
    </Card>
)
}

export default MostPunctualAirports;
