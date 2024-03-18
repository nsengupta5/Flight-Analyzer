import React, { useState } from 'react';
import axios from 'axios';
import Select from '../../form/Select';
import Submit from '../../form/Submit';
import Card from '../../ui/Card';

function getYears() {
  const startYear = 1987;
  const endYear = 2020;
  const years = [];

  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
}

function TopCancellationReason() {
  const years = getYears();
  const [year, setYear] = useState('');
  const [reason, setReason] = useState('');

  const handleYearChange = (e) => {
    setReason('');
    setYear(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Use axios to send the data to the backend
    axios.post('/api/top-cancellation-reason', {
      // Cast the years to integers
      year: Number(year)
    })
      .then((response) => {
        setReason(response.data.top_reason);
      })
      .catch((error) => {
        console.log(error);
      }
      )};

  return (
    <Card>
      <h1 class="text-black text-3xl font-sans font-semibold mb-8">Top Cancellation Reason</h1>
      <form onSubmit={handleSubmit} class="w-full">
        <div class="flex flex-col justify-center items-center w-full">
          <div>
            <Select placeholder="Select a year" options={years} label="year" onChange={handleYearChange} />
          </div>
          <div class="mt-7">
            <Submit placeholder="Get Top Cancellation Reason"/>
          </div>
        </div>
      </form>
      {reason !== '' && <p class="text-black text-1xl font-sans font-semibold mt-5">Top Cancellation Reason: {reason}</p>}
    </Card>
  )
}

export default TopCancellationReason;
