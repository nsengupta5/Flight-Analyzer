import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import axios from 'axios';
import Spinner from '../../ui/Spinner';

function WorstPerformingAirlines() {
  const [airlines, setAirlines] = useState(() => {
    const localData = localStorage.getItem('airlines');
    return localData ? JSON.parse(localData) : [];
  });
  const [loading, setLoading] = useState(airlines.length === 0);

  useEffect(() => {
    if (airlines.length > 0) {
      setLoading(false);
      return
    }
    axios.get('/api/worst-performing-airlines')
      .then((response) => {
        const fetchedAirlines = response.data.worst_performing_airlines;
        setAirlines(fetchedAirlines);
        localStorage.setItem('airlines', JSON.stringify(fetchedAirlines));
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      }
      )}
  , [airlines.length]);

  return (
    <Card className="w-5/6 max-w-md">
      <h1 class="text-black text-3xl font-sans font-semibold mb-3 text-center">Worst Performing Airlines</h1>
      {loading ? ( 
        <Spinner />
      ) :
        <>
          {airlines.map((airline, index) => (
          <p key={index} class="text-black text-m font-sans font-md mt-3">{(index + 1)}) {airline}</p>
        ))}
        </>
      }
    </Card>
  )
}

export default WorstPerformingAirlines;
