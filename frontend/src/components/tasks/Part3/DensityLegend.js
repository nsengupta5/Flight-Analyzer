/**
 * @file DensityLegend.js
 * @description This file contains the DensityLegend component which is used to display a legend for the density map.
 * The legend is displayed in the bottom right corner of the map and shows the color scale used to represent the 
 * density values.
 */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const DensityLegend = (props) => {
  const { colorScale, minVal, maxVal, rawMin, rawMax, title } = props;
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      
      // Split the color scale into 6 equal parts for colors
      const colorIncrement = (maxVal - minVal) / 6;
      const colorGrades = [minVal, minVal + colorIncrement, minVal + colorIncrement * 2, minVal + colorIncrement * 3, minVal + colorIncrement * 4, maxVal]; 

      // Split the actual range into 6 equal parts for labels
      const labelIncrement = (rawMax - rawMin) / 6;
      const labelGrades = [rawMin, rawMin + labelIncrement, rawMin + labelIncrement * 2, rawMin + labelIncrement * 3, rawMin + labelIncrement * 4, rawMax];

      // Define the styles of the legend
      div.style.backgroundColor = 'white'; 
      div.style.padding = '10px'; 
      div.style.border = '1px solid #ccc'; 
      div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)'; 
      let labels = [`<strong>${title}</strong><br>`];

      // Add the color scale to the legend with adjusted labels
      colorGrades.forEach((grade, index) => {
        const color = colorScale(grade).hex();
        const startLabel = Math.round(labelGrades[index])
        const endLabel = labelGrades[index + 1] ? Math.round(labelGrades[index + 1]) : '';
        labels.push(
          '<i style="background:' + color + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ' +
          startLabel + (endLabel ? '&ndash;' + endLabel + '<br>' : '+')
        );
      });

      div.innerHTML = labels.join('');
      return div;
    };

    // Add the legend to the map
    legend.addTo(map);

    return () => {
      // Remove the legend if the component is unmounted
      legend.remove();
    };
  }, [colorScale, map, minVal, maxVal, rawMin, rawMax, title]);

  return null;
};

export default DensityLegend;
