function Submit(props) {
  const { placeholder } = props;

  return (
    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{placeholder}</button>
  );
}

export default Submit;
