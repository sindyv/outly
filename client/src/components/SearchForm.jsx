import { useState } from 'react';

export default function SearchForm({ onSubmit, placeholder, buttonText, initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || 'Søk...'}
        className="flex-1 border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-400"
      />
      <button type="submit" className="bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800">
        {buttonText || 'Søk'}
      </button>
    </form>
  );
}
