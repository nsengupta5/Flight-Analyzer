/*
 * @file: Home.js
 * This component is the home page of the application
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

function Home() {
  return (
    <div class="flex flex-col justify-center items-center h-screen">
      <h1 class="text-black text-5xl font-sans font-semibold mb-16">InFlight</h1>
      <div class="flex flex-col md:flex-row justify-between items-center w-3/5 max-w-3xl space-y-4 md:space-y-0 md:space-x-4">
        <Link to ='data-analysis'><Button title="Data Analysis"/></Link>
        <Link to ='performance'><Button title="Performance Analysis"/></Link>
        <Link to ='advanced'><Button title="Advanced Insights"/></Link>
      </div>
    </div>
  )
}

export default Home;
