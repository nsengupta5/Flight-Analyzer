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
  const colorScale = chroma.scale(["orange", "blue"]).domain([minStateVal, maxStateVal]);
  const center = [37.8, -96.9];

  const stateStyle = (feature) => {
    const state = feature.properties.NAME;
    const score = statePerformance[state];

    return {
      fillColor: colorScale(score).hex(),
      fillOpacity: 1,
      color: "white",
      weight: 1 
    };
  }

  const midWestRegionStyle = {
    fillColor: "#FFBA49",
    fillOpacity: 0,
    color: "#FFBA49",
    weight: 3 
  };

  const westRegionStyle = {
    fillColor: "#8057A1",
    fillOpacity: 0,
    color: "#8057A1", 
    weight: 3 
  };

  const southRegionStyle = {
    fillColor: "#E88D5D",
    fillOpacity: 0,
    color: "#E88D5D", 
    weight: 3 
  };

  const northEastRegionStyle = {
    fillColor: "#5DA4FF",
    fillOpacity: 0,
    color: "#5DA4FF",
    weight: 3 
  };

  function onEachFeatureRegion(feature, layer) {
    layer.on({
      mouseover: (e) => {
        highlightFeature(e);
        showRegionScore(e); 
      },
      mouseout: resetHoverStyle,    
    });
  }

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

  function showRegionScore(e) {
    const regionName = e.target.feature.properties.NAME;
    const toolTipOffset = L.point(0, 0); 
    if (regionName === "West") {
      toolTipOffset.y = 490; 
      toolTipOffset.x = 500;
    }
    const score = regionPerformance[regionName].toFixed(2);
    e.target.bindTooltip(`${regionName}: ${score}%`, { permanent: false, direction: "auto", offset: toolTipOffset }).openTooltip();
  }

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
      <Legend colorScale={colorScale} minVal={minStateVal} maxVal={maxStateVal} />
    </MapContainer>
  );
}

export default USChloroplethMap;
