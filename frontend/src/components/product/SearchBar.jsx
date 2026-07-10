import React from 'react';
import { TextInput } from '@astryxdesign/core';

export const SearchBar = ({
  value,
  onChange,
  isDisabled = false
}) => {
  return (
    <TextInput
      label="Tìm kiếm sản phẩm"
      value={value}
      onChange={onChange}
      hasClear
      placeholder="Tìm theo tên hoặc thương hiệu"
      isDisabled={isDisabled}
    />
  );
};

export default SearchBar;
