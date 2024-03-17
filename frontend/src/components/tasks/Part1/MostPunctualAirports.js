import React, { useState } from 'react';
import axios from 'axios';
import Select from '../../form/Select';
import Submit from '../../form/Submit';

function MostPunctualAirports() {
  const years = [1987, 1997, 2007, 2017];
  const [year, setYear] = useState('');
  const [puncAirports, setPuncAirports] = useState([]);

  const handleYearChange = (e) => {
    setPuncAirports([]);
    setYear(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Use axios to send the data to the backend
    axios.post('/api/most-punctual-airports', {
      // Cast the years to integers
      year: Number(year)
    })
      .then((response) => {
        setPuncAirports(response.data.most_punctual_airports);
      })
      .catch((error) => {
        console.log(error);
      }
      )};

  return (
    <div class="flex flex-col justify-center items-center w-3/5 border-2 border-grey p-5">
      <h1 class="text-black text-3xl font-sans font-semibold mb-8">Most Punctual Airports</h1>
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
      {puncAirports.length > 0 &&
        <>
          <p class="text-black text-1xl font-sans font-semibold mt-5">Most Punctual Airports in {year}:</p>
          {puncAirports.map((airport, index) => (
          <p key={index} class="text-black text-sm font-sans font-md mt-3">{(index + 1)}) {airport}</p>
        ))}
        </>
      }
    </div>
  )
}

export default MostPunctualAirports;
