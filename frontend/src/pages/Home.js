import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

function Home() {
  return (
    <div class="flex flex-col justify-center items-center h-screen">
      <h1 class="text-black text-5xl font-sans font-semibold mb-16">AeroSights</h1>
      <div class="flex justify-between w-3/5">
        <Link to ='data-analysis'><Button title="Data Analysis"/></Link>
        <Link to ='performance'><Button title="Performance Analysis"/></Link>
        <Link to ='predictive'><Button title="Predictive Insights"/></Link>
      </div>
    </div>
  )
}

export default Home;
