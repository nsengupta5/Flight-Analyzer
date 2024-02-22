function Input(props) {
  const { placeholder, label } = props;

  return (
      <input type="text" id={label} placeholder={placeholder} class="w-64 border-2 border-grey boe" />
  );
}

export default Input;
