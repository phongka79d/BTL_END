import React from 'react';
import { TextInput } from '@astryxdesign/core';

export const SearchBar = ({
  value,
  onChange,
  isDisabled = false
}) => {
  return (
    <TextInput
      label="Search products"
      value={value}
      onChange={onChange}
      hasClear
      placeholder="Search by name or brand"
      isDisabled={isDisabled}
    />
  );
};

export default SearchBar;
