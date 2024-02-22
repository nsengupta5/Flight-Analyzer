function Select(props) {
  const { placeholder, options = [], label, onChange } = props;

  return (
    <select id={label} onChange={onChange} class="block appearance-none bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
      <option selected>{placeholder}</option>
      {options.map((option) => (
        <option value={option}>{option}</option>
      ))}
    </select>
  );
}

export default Select;
