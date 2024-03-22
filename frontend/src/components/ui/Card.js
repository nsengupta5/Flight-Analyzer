/**
 * @file Card.js
 * @description Card component for the application
 */

import React from 'react';

const Card = ({ children, className = "" }) => {
  return (
    <div class={`flex flex-col justify-center items-center border-2 border-grey p-5 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;

