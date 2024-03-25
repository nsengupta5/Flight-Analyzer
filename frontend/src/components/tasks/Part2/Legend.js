/**
 * @file Legend.js
 * @description Legend component for the map
 */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const Legend = (props) => {
  const { colorScale, minVal, maxVal, title } = props;
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      
      // Split the color scale into 6 equal parts
      const increment = (maxVal - minVal) / 6;
      const grades = [minVal, minVal + increment, minVal + increment * 2, minVal + increment * 3, minVal + increment * 4, maxVal]; 

      // Define the styles of the legend
      div.style.backgroundColor = 'white'; 
      div.style.padding = '10px'; 
      div.style.border = '1px solid #ccc'; 
      div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)'; 
      let labels = [`<strong>${title}</strong><br>`];

      // Add the color scale to the legend
      grades.forEach((grade) => {
        const color = colorScale(grade).hex();
        labels.push(
          '<i style="background:' + color + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ' +
          grade.toFixed(2) + (grades[grades.indexOf(grade) + 1] ? '&ndash;' + grades[grades.indexOf(grade) + 1].toFixed(2) + '<br>' : '+')
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
  }, [colorScale, map, minVal, maxVal, title]);

  return null;
};

export default Legend;
