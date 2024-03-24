/**
 * @file NetworkGraph.js
 * @description This file contains the NetworkGraph component which is used to display a network graph of airport routes.
 * The network graph is displayed using the ForceGraph2D component and shows the relationships between airports based on
 * the flights betweeen them.
 */
import React, { useRef, useEffect } from "react";
import { ForceGraph2D } from "react-force-graph";
import * as d3 from 'd3';

const NetworkGraph = ({ networkData }) => {
  const fgRef = useRef();

  useEffect(() => {
    const fg = fgRef.current;
    // Apply a force for each node to attract it to the center of its group
    fg.d3Force('charge', d3.forceManyBody().strength(-300)); // Repulsion between nodes
  }, []);


  // Render the network graph
  // Nodes are colored by the state they are in
  // Direction particles are used to show the flow of data between airports
  // The width of the links is based on the number of flights between airports
  // The speed of the particles is based on the number of flights between airports
  // Finally the particle width is based on the number of flights between airports
  return (
    <div class="mt-8">
      <ForceGraph2D
        ref={fgRef}
        graphData={networkData}
        nodeLabel={node => `${node.name} (${node.id})`}
        nodeAutoColorBy="group"
        linkDirectionalParticles="value"
        linkWidth={link => Math.sqrt(link.value)}
        linkDirectionalParticleSpeed={d => d.value * 0.0005}
        linkDirectionalParticleWidth={d => d.value * 0.8}  
        linkCurvature={0.25}
        width={1270}
        height={850}
        backgroundColor="#f9f9f9"
      />
    </div>
  );
}

export default NetworkGraph;
