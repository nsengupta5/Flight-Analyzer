function Input(props) {
  const { placeholder, label, onChange } = props;

  return (
      <input type="text" id={label} placeholder={placeholder} onChange={onChange} class="block appearance-none bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline max-w-72 w-5/6" />
  );
}

export default Input;
