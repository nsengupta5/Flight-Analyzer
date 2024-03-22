/**
 * @file Submit.js
 * @description Submit component for the application
 */
function Submit(props) {
  const { placeholder, className } = props;

  return (
    <button type="submit" class={`bg-violet-400 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded ${className}`}>{placeholder}</button>
  );
}

export default Submit;
