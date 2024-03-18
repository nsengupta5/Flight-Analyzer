import React, { useState } from 'react';
import axios from 'axios';
import Select from '../../form/Select';
import Submit from '../../form/Submit';
import Card from '../../ui/Card';
import Plot from 'react-plotly.js';

function getYears() {
  const startYear = 1987;
  const endYear = 2020;
  const years = [];

  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
}

function FlightTimeliness() {
  const years = getYears();
  const [year, setYear] = useState('');
  const [onTimeFlights, setOnTimeFlights] = useState(-1);
  const [delayedFlights, setDelayedFlights] = useState(-1);
  const [earlyFlights, setEarlyFlights] = useState(-1);
  const [totalFlights, setTotalFlights] = useState(-1);

  const handleYearChange = (e) => {
    setOnTimeFlights(-1);
    setDelayedFlights(-1);
    setEarlyFlights(-1);
    setTotalFlights(-1);
    setYear(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Use axios to send the data to the backend
    axios.post('/api/flight-timeliness-stats', {
      // Cast the years to integers
      year: Number(year)
    })
      .then((response) => {
        setOnTimeFlights(response.data.on_time_flights);
        setDelayedFlights(response.data.delayed_flights);
        setEarlyFlights(response.data.early_flights);
        setTotalFlights(response.data.total_flights);
      })
      .catch((error) => {
        console.log(error);
      }
      )};

  return (
    <Card>
      <h1 class="text-black text-3xl font-sans font-semibold mb-8">Flight Timeliness Stats</h1>
      <form onSubmit={handleSubmit} class="w-full">
        <div class="flex flex-col justify-center items-center w-full">
          <div>
            <Select placeholder="Select a year" options={years} label="year" onChange={handleYearChange} />
          </div>
          <div class="mt-7">
            <Submit placeholder="Get Timeliness Stats"/>
          </div>
        </div>
      </form>
      {totalFlights !== -1 &&
          onTimeFlights !== -1 &&
          delayedFlights !== -1 &&
          earlyFlights !== -1 &&
          <Plot
            // Pie chart showing the percentage of on-time, delayed, and early flights
            data={[
              {
                values: [onTimeFlights, delayedFlights, earlyFlights],
                  labels: ['On Time', 'Delayed', 'Early'],
                  type: 'pie'
              }
            ]}
            layout={{ autosize:true, title: 'Flight Timeliness Stats' }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
      }
    </Card>
  )
}

export default FlightTimeliness;
