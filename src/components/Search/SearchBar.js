import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.trim()) {
      // Debounced search could be implemented here
      onSearch(e.target.value.trim());
    } else {
      // Clear search results when input is empty
      onSearch('');
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setQuery('');
    onSearch(''); // Clear search results
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search stocks..."
          className="search-input"
        />
        {query && (
          <button type="button" className="clear-button" onClick={handleClear}>
            ✕
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
