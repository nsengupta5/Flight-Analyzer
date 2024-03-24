/**
 * @file USChloroplethMap.js
 * @description This file contains the USChloroplethMap component that displays the performance of each state
 * and region in the US. The performance is displayed using a chloropleth map where the color of each state
 * is determined by the performance score of that state. Regions are outlined in the map and the performance
 * score of each region is displayed when the user hovers over the region. The map also contains a legend that
 * shows the color scale used to determine the color of each state.
 */
import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MidWestOutline from '../../../data/Midwest.json'
import WestOutline from '../../../data/West.json'
import SouthOutline from '../../../data/South.json'
import NorthEastOutline from '../../../data/Northeast.json'
import StatesOutline from '../../../data/States.json'
import chroma from 'chroma-js';
import Legend from './Legend';
import L from 'leaflet';

function USChloroplethMap(props) {
  const { statePerformance, regionPerformance, minStateVal, maxStateVal } = props;
  // Define the color scale used to determine the color of each state
  const colorScale = chroma.scale(["orange", "blue"]).domain([minStateVal, maxStateVal]);
  const center = [37.8, -96.9];

  // Set the style of the state based on the performance score
  const stateStyle = (feature) => {
    const state = feature.properties.NAME;
    const score = statePerformance[state];
    return {
      fillColor: colorScale(score).hex(),
      fillOpacity: 0.8,
      color: "white",
      weight: 1 
    };
  }

  // Set the style of the MidWest region
  const midWestRegionStyle = {
    fillColor: "#FFBA49",
    fillOpacity: 0,
    color: "#FFBA49",
    weight: 3 
  };

  // Set the style of the West region
  const westRegionStyle = {
    fillColor: "#8057A1",
    fillOpacity: 0,
    color: "#8057A1", 
    weight: 3 
  };

  // Set the style of the South region
  const southRegionStyle = {
    fillColor: "#E88D5D",
    fillOpacity: 0,
    color: "#E88D5D", 
    weight: 3 
  };

  // Set the style of the NorthEast region
  const northEastRegionStyle = {
    fillColor: "#5DA4FF",
    fillOpacity: 0,
    color: "#5DA4FF",
    weight: 3 
  };

  // Actions to perform when the user hovers over a region
  function onEachFeatureRegion(feature, layer) {
    layer.on({
      mouseover: (e) => {
        highlightFeature(e);
        showRegionScore(e); 
      },
      mouseout: resetHoverStyle,    
    });
  }

  // Highlight the region when the user hovers over it and display the 
  // performance score
  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      weight: 4,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });

    showRegionScore(e); 
  }

  // Display the performance score of the region when the user hovers over it
  function showRegionScore(e) {
    const regionName = e.target.feature.properties.NAME;
    const toolTipOffset = L.point(0, 0); 
    // Adjust the tooltip offset for the West region
    if (regionName === "West") {
      toolTipOffset.y = 490; 
      toolTipOffset.x = 500;
    }

    // Round the score to two decimal places
    const score = regionPerformance[regionName].toFixed(2);
    e.target.bindTooltip(`${regionName}: ${score}%`, { permanent: false, direction: "auto", offset: toolTipOffset }).openTooltip();
  }

  // Reset the hover style of the region
  function resetHoverStyle(e) {
    e.target.setStyle({
      fillOpacity: 0, 
      weight: 3, 
      color: "#FFBA49" 
    });
    e.target.unbindTooltip(); 
  } 

  return (
    <MapContainer center={center} scrollWheelZoom={false} zoom={4} style={{ height: "60vh", width: "100%", marginTop: "2em" }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON data={StatesOutline} style={stateStyle} />
      <GeoJSON data={MidWestOutline} style={midWestRegionStyle} onEachFeature={onEachFeatureRegion} />
      <GeoJSON data={WestOutline} style={westRegionStyle} onEachFeature={onEachFeatureRegion} />
      <GeoJSON data={SouthOutline} style={southRegionStyle} onEachFeature={onEachFeatureRegion} /> 
      <GeoJSON data={NorthEastOutline} style={northEastRegionStyle} onEachFeature={onEachFeatureRegion} />
      <Legend colorScale={colorScale} minVal={minStateVal} maxVal={maxStateVal} title="Score (%)" />
    </MapContainer>
  );
}

export default USChloroplethMap;
