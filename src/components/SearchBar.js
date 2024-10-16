import React, { useState, useEffect, useRef } from 'react';

function SearchBar({ validators, onSelectValidator }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredValidators, setFilteredValidators] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0 && validators.length > 0) {
      const filtered = validators.filter(validator =>
        (validator.moniker && validator.moniker.toLowerCase().includes(searchTerm.toLowerCase())) ||
        validator.votePubkey.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredValidators(filtered);
      setShowDropdown(true);
    } else {
      setFilteredValidators([]);
      setShowDropdown(false);
    }
  }, [searchTerm, validators]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectValidator = (validator) => {
    onSelectValidator(validator);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        placeholder="Search validators..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-64 px-4 py-2 rounded-md bg-crypto-light text-crypto-text focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {showDropdown && filteredValidators.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-crypto-medium border border-crypto-light rounded-md shadow-lg">
          {filteredValidators.slice(0, 5).map((validator) => (
            <div
              key={validator.votePubkey}
              className="px-4 py-2 hover:bg-crypto-light cursor-pointer"
              onClick={() => handleSelectValidator(validator)}
            >
              <div className="flex items-center">
                <img
                  src={validator.pictureUrl || 'https://via.placeholder.com/40'}
                  alt={validator.moniker}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{validator.moniker || validator.votePubkey}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
