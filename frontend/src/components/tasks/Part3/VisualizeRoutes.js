/**
 * @file VisualizeRoutes.js
 * @description This file contains the VisualizeRoutes component which is used to display a network graph of airport routes.
 * The network graph is displayed using the NetworkGraph component and shows the relationships between airports based on
 * the routes between them.
 */
import React, { useState } from 'react';
import axios from 'axios';
import Card from '../../ui/Card';
import Spinner from '../../ui/Spinner';
import Submit from '../../form/Submit';
import NetworkGraph from './NetworkGraph';

function VisualizeRoutes() {
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState(() => {
    // Get network data from local storage if available
    const localData = localStorage.getItem('networkData');
    return localData ? JSON.parse(localData) : { nodes: [], links: [] };
  })
  const [showNetwork, setShowNetwork] = useState(false);

  const handleHideSubmit = (event) => {
    event.preventDefault();
    setShowNetwork(false);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowNetwork(true);
    
    if (networkData.nodes.length > 0) {
      return;
    }
    setLoading(true);
    axios.get('/api/get-routes', {
    })
      .then((response) => {
        console.log(response.data.routes);
        setNetworkData(response.data.routes);
        localStorage.setItem('networkData', JSON.stringify(response.data.routes));
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  return (
    <Card className="w-full max-w-[90rem]">
      <h1 class="mb-8 font-sans text-3xl font-semibold text-black text-center">Visualize Airport Routes</h1>
      <div class="w-full">
        <form onSubmit={handleSubmit} class="flex flex-col justify-center items-center w-full">
          <Submit placeholder="Visualize Airport Routes"/>
        </form>
      </div>
      {loading ?
        <Spinner /> : (
          showNetwork &&
          <>
          <form onSubmit={handleHideSubmit} class="flex flex-col justify-center items-center w-full mt-4">
            <Submit placeholder="Hide"/>
          </form>
            <NetworkGraph networkData={networkData} />
          </>
        )
      }
    </Card>
  );
};
export default VisualizeRoutes;
