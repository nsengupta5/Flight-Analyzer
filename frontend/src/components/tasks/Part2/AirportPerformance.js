import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../ui/Card';
import Select from 'react-select';
import Spinner from '../../ui/Spinner';

function AirportPerformance() {
  const [airports, setAirports] = useState(() => {
    const localData = localStorage.getItem('airports');
    return localData ? JSON.parse(localData) : [];
  });
  const [airportsSelected, setAirportsSelected] = useState([]);
  const [loading, setLoading] = useState(airports.length === 0);

  useEffect(() => {
    if (airports.length > 0) {
      setLoading(false);
      return;
    }
    axios.get('/api/get-airports')
      .then((response) => {
        const fetchedAirports = response.data.airports;
        console.log(fetchedAirports);
        setAirports(fetchedAirports);
        localStorage.setItem('airports', JSON.stringify(fetchedAirports));
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [airports.length]);

  return (
    <Card>
      {loading ? (
        <Spinner />
      ) :
      <div class="w-1/2">
        <Select
          options={airports.map(airport => ({ value: airport["OriginAirportID"], label: airport["Description"] }))}
          onChange={setAirportsSelected}
          value={airportsSelected}
          isMulti
        />
      </div>
      }
    </Card>
  );

};
export default AirportPerformance;
