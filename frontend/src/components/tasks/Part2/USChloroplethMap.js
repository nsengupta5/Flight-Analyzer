import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MidWestOutline from '../../../data/Midwest.json'
import WestOutline from '../../../data/West.json'
import SouthOutline from '../../../data/South.json'
import NorthEastOutline from '../../../data/Northeast.json'
import StatesOutline from '../../../data/States.json'

function USChloroplethMap() {
  const center = [37.8, -96.9];

  const stateStyle = {
    fillColor: "transparent",
    fillOpacity: 0,
    color: "grey",
    weight: 1 
  };

  const midWestRegionStyle = {
    fillColor: "transparent",
    fillOpacity: 0,
    color: "#e6c79c",
    weight: 3 
  };

  const westRegionStyle = {
    fillColor: "transparent",
    fillOpacity: 0,
    color: "#66ced6", 
    weight: 3 
  };

  const southRegionStyle = {
    fillColor: "transparent",
    fillOpacity: 0,
    color: "#cbbaed", 
    weight: 3 
  };

  const northEastRegionStyle = {
    fillColor: "transparent",
    fillOpacity: 0,
    color: "#b84a63",
    weight: 3 
  };

  return (
    <MapContainer center={center} zoom={4} style={{ height: "60vh", width: "100%" }}>
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON data={StatesOutline} style={stateStyle} />
      <GeoJSON data={MidWestOutline} style={midWestRegionStyle} />
      <GeoJSON data={WestOutline} style={westRegionStyle} />
      <GeoJSON data={SouthOutline} style={southRegionStyle} />
      <GeoJSON data={NorthEastOutline} style={northEastRegionStyle} />
    </MapContainer>
  );
}

export default USChloroplethMap;
