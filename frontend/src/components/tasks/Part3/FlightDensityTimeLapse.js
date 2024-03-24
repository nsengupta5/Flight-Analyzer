/**
 * @file FlightDensityTimeLapse.js
 * @description This file contains the FlightDensityTimeLapse component which is used to display a timelapse of the
 * flight density data. The timelapse is displayed as a map with the density values changing over time. The user can
 * control the playback speed and direction of the timelapse.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../ui/Card';
import Spinner from '../../ui/Spinner';
import Submit from '../../form/Submit';
import AirportMap from './AirportMap';

function FlightDensityTimeLapse() {
  const [loading, setLoading] = useState(false);
  const [timelapseData, setTimelapseData] = useState(null);
  const [minMaxDensity, setMinMaxDensity] = useState(null);
  const [currentYear, setCurrentYear] = useState(1987);
  const [play, setPlay] = useState(true);
  const [frameRate, setFrameRate] = useState(2000);
  const [goBack, setGoBack] = useState(false);
  const maxFrameRate = 8000;
  const minFrameRate = 125;

  // Handle the play event
  const handlePlay = (event) => {
    event.preventDefault();
    setPlay(true);
  }

  // Handle the pause event
  const handlePause = (event) => {
    event.preventDefault();
    setPlay(false);
  }

  // Handle the speed up event
  const handleSpeedUp = (event) => {
    event.preventDefault();
    if (frameRate > minFrameRate) {
      // Double the speed
      setFrameRate(frameRate / 2);
    }
  }

  // Handle the slow down event
  const handleSlowDown = (event) => {
    event.preventDefault();
    if (frameRate < maxFrameRate) {
      setFrameRate(frameRate * 2);
    }
  }

  // Handle the go back event
  const handleGoBack = (event) => {
    event.preventDefault();
    setGoBack(true);
  }

  // Handle the go forward event
  const handleGoForward = (event) => {
    event.preventDefault();
    setGoBack(false);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    axios.get('/api/get-timelapse-data', {
    })
      .then((response) => {
        setTimelapseData(response.data.timelapseData);
        setMinMaxDensity(response.data.min_max_values);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    let interval = null;

    if (play && timelapseData && !goBack) {
      interval = setInterval(() => {
        // Set the current year to the next year in the timelapse data
        setCurrentYear(year => {
          const years = Object.keys(timelapseData);
          const index = years.indexOf(year.toString());
          const nextIndex = (index + 1) % years.length;
          return years[nextIndex];
        });
      }, frameRate); // Update interval in milliseconds
    } else if (play && timelapseData && goBack) {
      interval = setInterval(() => {
        // Set the current year to the previous year in the timelapse data
        setCurrentYear(year => {
          const years = Object.keys(timelapseData);
          const index = years.indexOf(year.toString());
          if (index === 0) {
            return years[years.length - 1];
          }
          const nextIndex = (index - 1) % years.length;
          return years[nextIndex];
        });
      }, frameRate); // Update interval in milliseconds
    }
    else if (!play) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [play, timelapseData, frameRate, goBack]);

  return (
    <Card className="w-full mt-5 max-w-[90rem]">
      <h1 class="mb-8 font-sans text-3xl font-semibold text-black text-center">Flight Density Timelapse</h1>
      <div class="w-full">
        <form onSubmit={handleSubmit} class="flex flex-col justify-center items-center w-full">
          <Submit placeholder="Visualize Timelapse"/>
        </form>
      </div>
      {loading ? (
        <Spinner />
      ) : timelapseData ? (
        <>
          <h4 class="w-full text-center text-2xl font-semibold mt-8">Current Year: {currentYear}</h4>
          <div class="flex flex-col md:flex-row justify-center items-center mt-8 w-5/6">
            <form onSubmit={handleGoBack} class="flex flex-col justify-center items-center w-full">
              <Submit placeholder="<<"/>
            </form>
            <form onSubmit={handleSlowDown} class="flex flex-col justify-center items-center w-full">
              <Submit placeholder="Slow Down 2x"/>
            </form>
            <form onSubmit={handlePlay} class="flex flex-col justify-center items-center w-full">
              <Submit placeholder="Play"/>
            </form>
            <h4 class="w-full text-center text-1xl font-semibold">Speed: {frameRate} ms</h4>
            <form onSubmit={handlePause} class="flex flex-col justify-center items-center w-full">
              <Submit placeholder="Pause"/>
            </form>
            <form onSubmit={handleSpeedUp} class="flex flex-col justify-center items-center w-full">
              <Submit placeholder="Speed Up 2x"/>
            </form>
            <form onSubmit={handleGoForward} class="flex flex-col justify-center items-center w-full">
              <Submit placeholder=">>"/>
            </form>
          </div>
          {timelapseData && minMaxDensity && (
        <AirportMap stateDensity={timelapseData[currentYear]} minMaxVals={minMaxDensity[currentYear]} />
          )}
        </>
      ) : null}
    </Card>
  );
};
export default FlightDensityTimeLapse;
