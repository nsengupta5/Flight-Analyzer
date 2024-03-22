import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';

function Predictive() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModel() {
      const response = await fetch('/api/get-predictive-model');
      const model = await response.json();
      setModel(model);
      setLoading(false);
    }
    fetchModel();
  }, []);

  return (
      <Card className="w-full max-w-6xl">
        <h1 className="mb-5 text-4xl font-semibold text-gray-800">Predictive Model</h1>
        <h3 className="mb-5 text-2xl font-semibold text-gray-800">Step 1. Data Exploration</h3>
        <h3 className="mb-5 text-2xl font-semibold text-gray-800">Step 2. Data Preprocessing</h3>
        <h3 className="mb-5 text-2xl font-semibold text-gray-800">Step 3. Feature Selection</h3>
        <h3 className="mb-5 text-2xl font-semibold text-gray-800">Step 4. Model Selection</h3>
      </Card>
  );
}

export default Predictive;
