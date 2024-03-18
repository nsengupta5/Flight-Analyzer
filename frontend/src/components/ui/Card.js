import React from 'react';

const Card = ({ children, className = "" }) => {
  return (
    <div className={`flex flex-col justify-center items-center w-3/5 border-2 border-grey p-5 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;

