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
      </Card>
  );
}

export default Predictive;
