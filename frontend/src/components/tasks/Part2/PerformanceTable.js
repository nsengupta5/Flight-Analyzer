/**
 * @file PerformanceTable.js
 * @description A table component that displays the performance of states in different regions.
 * The data prop is an object with regions as keys and arrays of states as values.
 * The table displays the states in each region in descending order of performance.
 */
import React from 'react';

function PerformanceTable(props) {
  const { data } = props; // Assuming data is an object with regions as keys and arrays of states as values

  // Helper function to render table rows
  const renderTableRows = (data) => {
    // Find the length of the longest array to determine the number of rows
    const maxRows = Math.max(...Object.values(data).map(region => region.length));

    // Create table rows
    let tableRows = [];
    for (let i = 0; i < maxRows; i++) {
      let row = (
        <tr key={i} className="border-b border-neutral-200 dark:border-black/10">
          <td className="px-6 py-4 font-medium whitespace-nowrap">{i + 1}</td>
          {Object.values(data).map((region, index) => (
            // Check if the state exists at the current index
            <td key={index} className="px-6 py-4 whitespace-nowrap">
              {region[i]
                ? `${region[i].state} (${Math.round(region[i].score)}%)`
                : 'N/A'} {/* Fallback if there is no state for the current row */}
            </td>
          ))}
        </tr>
      );
      tableRows.push(row);
    }
    return tableRows;
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full text-sm font-light text-left text-surface dark:text-black">
              <thead className="font-medium border-b border-neutral-200 dark:border-black/10">
                <tr>
                  <th scope="col" className="px-6 py-4">#</th>
                  <th scope="col" className="px-6 py-4">Midwest</th>
                  <th scope="col" className="px-6 py-4">Northeast</th>
                  <th scope="col" className="px-6 py-4">South</th>
                  <th scope="col" className="px-6 py-4">West</th>
                </tr>
              </thead>
              <tbody>
                {renderTableRows(data)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceTable;
