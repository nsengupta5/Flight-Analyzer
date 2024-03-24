/**
 * @file AirportPerformance.js
 * @description This file allows the user to compare the performance of different airports based on various metrics.
 * The metrics are chosen to best represent the performance of the airport. 
 * The user can select multiple airports to compare and the data is displayed in a radar chart. 
 * The radar chart is used to compare the performance of multiple airports based on multiple metrics.
 */

import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import Card from '../../ui/Card';
import Select from 'react-select';
import Spinner from '../../ui/Spinner';
import Submit from '../../form/Submit';

/**
 * @function getAirportCodes
 * @description This function takes in an array of airports and returns an array of airport codes.
 * @param {Array} airports - An array of airports.
 * @returns {Array} - An array of airport codes.
 */
function getAirportCodes(airports) {
  let airportCodes = [];
  for (let i = 0; i < airports.length; i++) {
    airportCodes.push(airports[i].value);
  }
  return airportCodes;
}

/**
 * @function getAirportDataCodes
 * @description This function takes in an array of airport data and returns an array of airport data codes.
 * @param {Array} airportData - An array of airport data.
 * @returns {Array} - An array of airport data codes.
 */
function getAirportDataCodes(airportData) {
  let airportDataCodes = [];
  let sample_mapping = airportData[0];
  for (let key in sample_mapping) {
    // Exclude the metric key
    if (key !== "metric")
      airportDataCodes.push(key);
  }
  return airportDataCodes;
}

function AirportPerformance() {
  const [airports, setAirports] = useState(() => {
    // Get airports from local storage if available
    const localData = localStorage.getItem('airports');
    return localData ? JSON.parse(localData) : [];
  });
  const [airportsSelected, setAirportsSelected] = useState([]);
  const [airportLoading, setAirportLoading] = useState(airports.length === 0);
  const [loading, setLoading] = useState(false);
  const [airportData, setAirportData] = useState([]);
  const [airportDataCodes, setAirportDataCodes] = useState([]);
  const colorPalette = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"]

  // Get airport performance data
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

  // Custom handler for setting selected airports with limit
  const handleAirportSelectionChange = (selectedOptions) => {
    if (selectedOptions.length <= 5) { // Limit the selections to 5
      setAirportsSelected(selectedOptions);
    } else {
      // Optionally, alert the user that they can only select up to 5 airports
      alert('You can only select up to 5 airports for comparison.');
    }
  };

  // Fetch airports if not available in local storage
  useEffect(() => {
    if (airports.length > 0) {
      setAirportLoading(false);
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
        setAirportLoading(false);
      });
  }, [airports.length]);

  // Update airport data codes when airport data changes
  useEffect(() => {
    setAirportDataCodes(getAirportDataCodes(airportData));
  }, [airportData]);

  return (
    <Card className="w-full max-w-3xl">
      <h1 class="mb-8 font-sans text-3xl font-semibold text-black text-center">Airport Performance Comparison</h1>
      {airportLoading ? (
        <Spinner />
      ) : airports.length !== 0 &&
      <>
        <h3 class="text-black text-2xl font-sans font-small mb-5 text-center">Choose airports to compare:</h3>
        <div class="w-full">
          <form onSubmit={handleSubmit} class="flex flex-col justify-center items-center w-full">
            <Select
              options={airports.map(airport => ({ value: airport["OriginAirportID"], label: airport["Description"] }))}
              onChange={handleAirportSelectionChange}
              value={airportsSelected}
              isMulti
              className="w-5/6"
            />
            <div class="mt-7">
              <Submit placeholder="Compare Airport Performance"/>
            </div>
          </form>
        </div>
        </>
      }
      {/* Render the radar chart if data is available */}
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
                  fillOpacity={0} 
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
