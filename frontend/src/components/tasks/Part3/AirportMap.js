/**
 * @file AirportMap.js
 * @description This file contains the AirportMap component which is responsible for rendering 
 * the map of the United States with the density of flights in each state represented by color.
 */
import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import StatesOutline from '../../../data/States.json'
import chroma from 'chroma-js';
import DensityLegend from './DensityLegend';

function AirportMap(props) {
  const { stateDensity, minMaxVals } = props;

  const center = [37.8, -96.9];
  
  // Logarithmic min and max values for density
  const minDensity = Math.min(...Object.values(stateDensity));
  const maxDensity = Math.max(...Object.values(stateDensity));

  // Raw min and max values for density
  const rawMinDensity = minMaxVals["min"];
  const rawMaxDensity = minMaxVals["max"];
  const colorScale = chroma.scale(["orange", "blue"]).domain([minDensity, maxDensity]);

  const stateStyle = (feature) => {
    const state = feature.properties.NAME;
    const density = stateDensity[state];
    return {
      fillColor: colorScale(density).hex(),
      fillOpacity: 0.8,
      color: "white",
      weight: 1 
    };
  }

  return (
    <MapContainer center={center} scrollWheelZoom={false} zoom={4} style={{ height: "60vh", width: "100%", marginTop: "2em" }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON data={StatesOutline} style={stateStyle} />
      <DensityLegend colorScale={colorScale} rawMin={rawMinDensity} rawMax={rawMaxDensity} minVal={minDensity} maxVal={maxDensity} title="Flight Count" />
    </MapContainer>
  );

}

export default AirportMap;
