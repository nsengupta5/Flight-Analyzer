import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../ui/Card';
import Slider from '../../form/Slider';
import USChloroplethMap from './USChloroplethMap';
import Select from '../../form/Select';

const minYear = 1987;
const maxYear = 2020;

function StatePerformance() {
  const metrics = [
    'Arrival Delay Rate',
    'Departure Delay ',
    'Cancellation Rate',
    'Diversions Rate',
    'Mean Security Delay',
    'Mean Taxi In Time',
    'Mean Taxi Out Time',
  ];
  const [year, setYear] = useState(1987);
  const [metric, setMetric] = useState('Arrival Delay Rate');

  function handleYearChange(event) {
    event.preventDefault();
    setYear(event.target.value);
  }

  function handleMetricChange(event) {
    event.preventDefault();
    setMetric(event.target.value);
  }

  useEffect(() => {
    axios.post('/api/state-performance', {
      year: year,
      metric: metric,
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  return (
    <Card className="w-full max-w-6xl mt-10">
      <p class="text-black text-2xl font-sans font-semibold mb-8 text-center">Choose a metric:</p>
      <Select placeholder="Select a metric" options={metrics} label="year" onChange={handleMetricChange} className="mb-8" />
      <USChloroplethMap /> 
      <Slider value={year} minVal={minYear} maxVal={maxYear} label={`Current Year: ${year}`} onChange={handleYearChange} className="w-5/6 mt-8" />
    </Card>
  );

};
export default StatePerformance;
