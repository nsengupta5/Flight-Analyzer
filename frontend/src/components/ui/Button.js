import React from 'react';

function Button(props) {
  const { title } = props;

  return (
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-md">
      {title}
    </button>
  )
}

export default Button;
