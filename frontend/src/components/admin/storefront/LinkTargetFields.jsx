import React from 'react';
import { FormLayout, Selector, TextInput } from '@astryxdesign/core';
import ProductPicker from '../ProductPicker';
import { LINK_TYPE_OPTIONS } from './storefrontFormUtils';

const toCategoryOptions = (categories) => categories.map((category) => ({
  value: category.id,
  label: category.name || category.id,
}));

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

export const LinkTargetFields = ({
  categories,
  errors,
  fieldPrefix = '',
  updateField,
  values,
}) => {
  const toFieldName = (fieldName) => {
    if (!fieldPrefix) return fieldName;
    return `${fieldPrefix}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
  };
  const linkTypeKey = toFieldName('linkType');
  const productIdKey = toFieldName('productId');
  const categoryIdKey = toFieldName('categoryId');
  const customUrlKey = toFieldName('customUrl');
  const linkType = values[linkTypeKey];

  return (
    <FormLayout>
      <Selector
        label={fieldPrefix ? 'Featured link type' : 'Link type'}
        options={LINK_TYPE_OPTIONS}
        value={linkType}
        onChange={(value) => updateField(linkTypeKey, value)}
        width="100%"
      />
      {linkType === 'product' && (
        <ProductPicker
          value={values[productIdKey] || undefined}
          onChange={(value) => updateField(productIdKey, value)}
          status={fieldStatus(errors[productIdKey])}
        />
      )}
      {linkType === 'category' && (
        <Selector
          label="Category target"
          options={toCategoryOptions(categories)}
          value={values[categoryIdKey] || undefined}
          onChange={(value) => updateField(categoryIdKey, value)}
          placeholder="Select category"
          status={fieldStatus(errors[categoryIdKey])}
          width="100%"
        />
      )}
      {linkType === 'customUrl' && (
        <TextInput
          label="Custom URL"
          value={values[customUrlKey]}
          onChange={(value) => updateField(customUrlKey, value)}
          placeholder="/products or https://example.com"
          status={fieldStatus(errors[customUrlKey])}
          width="100%"
        />
      )}
    </FormLayout>
  );
};

export default LinkTargetFields;
