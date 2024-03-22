/**
 * @file Button.js
 * @description Button component for the application
 */
import React from 'react';

function Button(props) {
  const { title } = props;

  return (
    <button class="bg-violet-400 hover:bg-violet-500 text-white font-bold py-4 px-4 rounded-md">
      {title}
    </button>
  )
}

export default Button;
