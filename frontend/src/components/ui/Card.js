import React from 'react';

const Card = ({ children, className = "" }) => {
  return (
    <div class={`flex flex-col justify-center items-center max-w-md w-full border-2 border-grey p-5 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;

