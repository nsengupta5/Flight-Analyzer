import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const Legend = (props) => {
  const { colorScale, minVal, maxVal } = props;
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      

      const increment = (maxVal - minVal) / 6;
      const grades = [minVal, minVal + increment, minVal + increment * 2, minVal + increment * 3, minVal + increment * 4, maxVal]; 
      div.style.backgroundColor = 'white'; 
      div.style.padding = '10px'; 
      div.style.border = '1px solid #ccc'; 
      div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)'; 
      let labels = ['<strong>Score (%)</strong><br>'];

      grades.forEach((grade) => {
        const color = colorScale(grade).hex();
        labels.push(
          '<i style="background:' + color + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ' +
          Math.round(grade) + (grades[grades.indexOf(grade) + 1] ? '&ndash;' + Math.round(grades[grades.indexOf(grade) + 1]) + '<br>' : '+')
        );
      });

      div.innerHTML = labels.join('');
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [colorScale, map, minVal, maxVal]);

  return null;
};

export default Legend;
