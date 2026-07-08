import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, HStack, Text, TextInput, VStack } from '@astryxdesign/core';
import { productApi } from '../../api/productApi';
import Pagination from '../common/Pagination';
import { formatPrice, getProductImageSrc } from '../product/productUtils';

const searchDelayMs = 300;
const defaultPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1
};

const ProductSummary = ({ product }) => (
  <HStack gap={3} style={{ alignItems: 'center', minWidth: 0, width: '100%' }}>
    <VStack
      style={{
        width: 'calc(var(--spacing-8) * 2)',
        minWidth: 'calc(var(--spacing-8) * 2)',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        borderRadius: 'var(--radius-element)',
        backgroundColor: 'var(--color-background-muted)'
      }}
    >
      <img
        src={getProductImageSrc(product.imageUrl)}
        alt={product.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        loading="lazy"
      />
    </VStack>
    <VStack gap={1} style={{ minWidth: 0, flex: 1 }}>
      <Text weight="semibold">{product.name}</Text>
      <Text color="secondary" size="supporting">
        {product.brand || 'Brand unavailable'} - {product.category?.name || 'Uncategorized'}
      </Text>
      <HStack gap={2} style={{ flexWrap: 'wrap' }}>
        <Badge variant="blue" label={formatPrice(product.price)} />
        <Badge variant={Number(product.quantity) > 0 ? 'green' : 'red'} label={`Stock ${product.quantity ?? 0}`} />
      </HStack>
    </VStack>
  </HStack>
);

export const ProductPicker = ({
  isDisabled = false,
  onChange,
  pageSize = 20,
  showInitialProducts = false,
  status,
  value,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [pagination, setPagination] = useState(defaultPagination);
  const [results, setResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchKeyword = query.trim().length >= 2 && debouncedQuery.length >= 2
    ? debouncedQuery
    : '';

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, searchDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    let isActive = true;

    if (!value) {
      setSelectedProduct(null);
      return undefined;
    }

    productApi.getProductById(value)
      .then((response) => {
        if (isActive) {
          setSelectedProduct(response?.data?.product || null);
        }
      })
      .catch(() => {
        if (isActive) {
          setSelectedProduct(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [value]);

  useEffect(() => {
    let isActive = true;

    const shouldFetchProducts = showInitialProducts || searchKeyword.length >= 2;

    if (!shouldFetchProducts) {
      setResults([]);
      setPagination({ ...defaultPagination, limit: pageSize });
      setIsSearching(false);
      setSearchError('');
      return undefined;
    }

    setIsSearching(true);
    setSearchError('');

    productApi.getProducts({ keyword: searchKeyword, page: productPage, limit: pageSize })
      .then((response) => {
        if (isActive) {
          setResults(response?.data?.items || []);
          setPagination(response?.data?.pagination || {
            ...defaultPagination,
            page: productPage,
            limit: pageSize
          });
        }
      })
      .catch((error) => {
        if (isActive) {
          setResults([]);
          setSearchError(error?.message || 'Unable to search products.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsSearching(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [pageSize, productPage, searchKeyword, showInitialProducts]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    onChange(product.id);
  };

  const handleSearchChange = (nextQuery) => {
    setQuery(nextQuery);
    setProductPage(1);
  };

  return (
    <VStack gap={3}>
      <TextInput
        label="Search products"
        value={query}
        onChange={handleSearchChange}
        placeholder="Type product name or brand"
        status={status}
        isDisabled={isDisabled}
        width="100%"
      />

      {selectedProduct && (
        <Card padding={3} variant="muted">
          <HStack gap={3} style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <ProductSummary product={selectedProduct} />
            <Button
              label="Clear"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedProduct(null);
                onChange('');
              }}
              isDisabled={isDisabled}
            />
          </HStack>
        </Card>
      )}

      {searchError && <Text color="danger">{searchError}</Text>}
      {isSearching && <Text color="secondary" size="supporting">Searching products...</Text>}
      {!isSearching && (showInitialProducts || query.trim().length >= 2) && results.length === 0 && !searchError && (
        <Text color="secondary" size="supporting">
          {searchKeyword ? 'No matching products.' : 'No products available.'}
        </Text>
      )}
      {!isSearching && results.length > 0 && (
        <VStack gap={2}>
          {results.map((product) => (
            <Card key={product.id} padding={3}>
              <HStack gap={3} style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <ProductSummary product={product} />
                <Button
                  label={value === product.id ? 'Selected' : 'Select'}
                  variant={value === product.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleSelectProduct(product)}
                  isDisabled={isDisabled || value === product.id}
                />
              </HStack>
            </Card>
          ))}
        </VStack>
      )}
      {!isSearching && showInitialProducts && results.length > 0 && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setProductPage}
        />
      )}
    </VStack>
  );
};

export default ProductPicker;
