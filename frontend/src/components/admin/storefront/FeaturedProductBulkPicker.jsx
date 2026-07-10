import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CheckboxList,
  CheckboxListItem,
  HStack,
  Text,
  TextInput,
  VStack
} from '@astryxdesign/core';
import { productApi } from '../../../api/productApi';
import Pagination from '../../common/Pagination';
import { ProductSummary } from '../ProductPicker';

const searchDelayMs = 300;
const defaultPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
};

export const FeaturedProductBulkPicker = ({
  isDisabled = false,
  onAddProducts,
  pageSize = 10,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [pagination, setPagination] = useState(defaultPagination);
  const [results, setResults] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
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

    if (searchKeyword.length < 2) {
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
          setSearchError(error?.message || 'Không thể tìm kiếm sản phẩm.');
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
  }, [pageSize, productPage, searchKeyword]);

  const handleSearchChange = (nextQuery) => {
    setQuery(nextQuery);
    setProductPage(1);
  };

  const handleAddSelectedProducts = async () => {
    if (!selectedProductIds.length) return;

    await onAddProducts({ productIds: selectedProductIds });
    setSelectedProductIds([]);
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setProductPage(1);
  };

  return (
    <VStack gap={3}>
      <TextInput
        label="Tìm kiếm sản phẩm"
        value={query}
        onChange={handleSearchChange}
        placeholder="Nhập tên sản phẩm hoặc thương hiệu"
        isDisabled={isDisabled}
        width="100%"
      />
      {searchError && <Text color="danger">{searchError}</Text>}
      {isSearching && <Text color="secondary" size="supporting">Đang tìm kiếm sản phẩm...</Text>}
      {!isSearching && query.trim().length >= 2 && results.length === 0 && !searchError && (
        <Text color="secondary" size="supporting">Không có sản phẩm phù hợp.</Text>
      )}
      {!isSearching && results.length > 0 && (
        <Card padding={0}>
          <VStack
            gap={2}
            style={{
              maxHeight: '280px',
              overflowY: 'auto',
              padding: 'var(--spacing-2)'
            }}
          >
            <CheckboxList
              label="Sản phẩm"
              isLabelHidden
              value={selectedProductIds}
              onChange={setSelectedProductIds}
              isDisabled={isDisabled}
              hasDividers
            >
              {results.map((product) => (
                <CheckboxListItem
                  key={product.id}
                  value={product.id}
                  label={<ProductSummary product={product} />}
                />
              ))}
            </CheckboxList>
          </VStack>
        </Card>
      )}
      {!isSearching && results.length > 0 && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setProductPage}
        />
      )}
      <HStack gap={2} justify="end">
        <Button
          label={`Thêm ${selectedProductIds.length} sản phẩm đã chọn`}
          variant="primary"
          isDisabled={selectedProductIds.length === 0 || isDisabled}
          onClick={handleAddSelectedProducts}
        />
      </HStack>
    </VStack>
  );
};

export default FeaturedProductBulkPicker;
