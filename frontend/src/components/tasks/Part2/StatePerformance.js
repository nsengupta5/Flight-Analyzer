import React, { useState } from 'react';
import axios from 'axios';
import Card from '../../ui/Card';
import USChloroplethMap from './USChloroplethMap';
import Select from '../../form/Select';
import Submit from '../../form/Submit';
import Spinner from '../../ui/Spinner';
import PerformanceTable from './PerformanceTable';

function getYears() {
  const startYear = 1987;
  const endYear = 2020;
  const years = [];

  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
}

function StatePerformance() {
  const metrics = [
    'Arrival Delay Rate',
    'Departure Delay Rate',
    'Cancellation Rate',
    'Diversion Rate',
    'Mean Taxi In Time',
    'Mean Taxi Out Time',
    'Composite Score'
  ];
  const [year, setYear] = useState(1987);
  const [metric, setMetric] = useState('Arrival Delay Rate');
  const [statePerformance, setStatePerformance] = useState({});
  const [regionPerformance, setRegionPerformance] = useState({});
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [minStateVal, setMinStateVal] = useState(0);
  const [maxStateVal, setMaxStateVal] = useState(100);
  const [bestStates, setBestStates] = useState({});
  const [worstStates, setWorstStates] = useState({});
  const [error, setError] = useState(null);

  function handleYearChange(event) {
    event.preventDefault();
    setYear(event.target.value);
  }

  function handleMetricChange(event) {
    event.preventDefault();
    setMetric(event.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    axios.post('/api/get-state-performance', {
      year: Number(year),
      metric: metric,
    })
      .then((response) => {
        console.log(response.data.performance_data);
        setStatePerformance(response.data.performance_data["state_performance"]);
        setMinStateVal(response.data.performance_data["min_state_val"]);
        setMaxStateVal(response.data.performance_data["max_state_val"]);
        setRegionPerformance(response.data.performance_data["region_performance"]);
        setBestStates(response.data.performance_data["best_states"]);
        setWorstStates(response.data.performance_data["worst_states"]);
        setShowMap(true);
      })
      .catch((error) => {
        setError(error.response.data.error);
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  return (
    <Card className="w-full max-w-6xl mt-10">
      <h1 class="mb-4 font-sans text-3xl font-semibold text-black text-center">State Performance Comparison</h1>
      <form class="flex flex-col w-full justify-center items-center sm:flex flex-row" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center w-3/6 mb-2">
          <h3 class="text-black text-2xl font-sans font-small mb-5 mt-5 text-center">Choose a metric:</h3>
          <Select placeholder="Select a metric" options={metrics} label="metric" onChange={handleMetricChange} className="w-full ml-3" />
        </div>
        <div className="flex flex-col items-center justify-center w-3/6 mb-8">
          <h3 class="text-black text-2xl font-sans font-small mb-5 mt-5 text-center">Choose a year:</h3>
          <Select placeholder="Select a year" options={getYears()} label="year" onChange={handleYearChange} className="w-full ml-3" />
        </div>
        <Submit placeholder="Compare State Performance" className="h-1/3"/>
      </form>
      {loading ? (
          <Spinner />
      ) : error ? (
        <div className="mt-3 font-semibold text-center text-red-500">{error}</div>
      ) : showMap && <>
        <USChloroplethMap statePerformance={statePerformance} regionPerformance={regionPerformance} minStateVal={minStateVal} maxStateVal={maxStateVal} />
        <div class="flex flex-col justify-between">
          <div className="mt-8 mb-3 text-3xl font-semibold text-center text-black">
            <h1 class="text-3xl">Best Performing States</h1>
            <PerformanceTable data={bestStates} />
          </div>
          <div className="mt-8 mb-3 ml-5 text-3xl font-semibold text-center text-black">
            <h1 class="text-3xl">Worst Performing States</h1>
            <PerformanceTable data={worstStates}/>
          </div>
        </div>
      </>
      }
    </Card>
  );

};
export default StatePerformance;
