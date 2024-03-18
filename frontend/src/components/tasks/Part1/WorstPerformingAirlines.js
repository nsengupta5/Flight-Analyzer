import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WorstPerformingAirlines() {
  const [airlines, setAirlines] = useState([])

  useEffect(() => {
    axios.get('/api/worst-performing-airlines')
      .then((response) => {
        setAirlines(response.data.worst_performing_airlines);
        console.log(airlines);
      })
      .catch((error) => {
        console.log(error);
      }
      )}
  , []);

  return (
    <div class="flex flex-col justify-center items-center w-3/5 border-2 border-grey p-5">
      <h1 class="text-black text-3xl font-sans font-semibold mb-3">Worst Performing Airlines</h1>
      {airlines && 
        <>
          {airlines.map((airline, index) => (
          <p key={index} class="text-black text-m font-sans font-md mt-3">{(index + 1)}) {airline}</p>
        ))}
        </>
      }
    </div>
  )
}

export default WorstPerformingAirlines;
