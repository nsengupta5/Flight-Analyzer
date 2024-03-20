import React, { useState, useEffect, PureComponent } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import Card from '../../ui/Card';
import Select from 'react-select';
import Spinner from '../../ui/Spinner';
import Submit from '../../form/Submit';

function getAirportCodes(airports) {
  let airportCodes = [];
  for (let i = 0; i < airports.length; i++) {
    airportCodes.push(airports[i].value);
  }
  return airportCodes;
}

function getAirportDataCodes(airportData) {
  let airportDataCodes = [];
  let sample_mapping = airportData[0];
  for (let key in sample_mapping) {
    if (key !== "metric")
      airportDataCodes.push(key);
  }
  return airportDataCodes;
}


function AirportPerformance() {
  const [airports, setAirports] = useState(() => {
    const localData = localStorage.getItem('airports');
    return localData ? JSON.parse(localData) : [];
  });
  const [airportsSelected, setAirportsSelected] = useState([]);
  const [loading, setLoading] = useState(airports.length === 0);
  const [airportData, setAirportData] = useState([]);
  const [airportDataCodes, setAirportDataCodes] = useState([]);
  const colorPalette = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"]

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post('/api/get-airport-performance', {
      airports: getAirportCodes(airportsSelected)
    })
      .then((response) => {
        setAirportData(response.data.airport_data);
        console.log(response.data.airport_data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      }
    )
  };

  useEffect(() => {
    if (airports.length > 0) {
      setLoading(false);
      return;
    }
    axios.get('/api/get-airports')
      .then((response) => {
        const fetchedAirports = response.data.airports;
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

  useEffect(() => {
    setAirportDataCodes(getAirportDataCodes(airportData));
  }, [airportData]);

  return (
    <Card className="w-full max-w-3xl">
      <div class="w-full">
        <form onSubmit={handleSubmit} class="flex flex-col justify-center items-center w-full">
          <Select
            options={airports.map(airport => ({ value: airport["OriginAirportID"], label: airport["Description"] }))}
            onChange={setAirportsSelected}
            value={airportsSelected}
            isMulti
            className="w-5/6"
          />
          <div class="mt-7">
            <Submit placeholder="Compare Airport Performance"/>
          </div>
        </form>
      </div>
      {loading ? (
        <Spinner />
      ) : airportData.length != 0 && airportDataCodes.length != 0 &&
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={airportData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              {airportDataCodes.map((code, index) => (
                <Radar 
                  key={index} 
                  name={code} 
                  dataKey={code} 
                  stroke={colorPalette[index % colorPalette.length]}
                  strokeWidth={2}
                  fill={colorPalette[index % colorPalette.length]}
                  fillOpacity={0.6} 
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
      }
    </Card>
  );

};
export default AirportPerformance;
