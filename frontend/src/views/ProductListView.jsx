import React, { useEffect, useState } from 'react';
import { VStack, Heading, Text } from '@astryxdesign/core';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import Alert from '../components/common/Alert';
import ProductFilter from '../components/product/ProductFilter';
import ProductList from '../components/product/ProductList';

const defaultFilters = {
  keyword: '',
  categoryId: '',
  minPrice: '',
  maxPrice: ''
};

const toProductQuery = (filters, page) => {
  const query = {
    page,
    limit: 12
  };

  if (filters.keyword.trim()) {
    query.keyword = filters.keyword.trim();
  }

  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  if (filters.minPrice !== '') {
    query.minPrice = filters.minPrice;
  }

  if (filters.maxPrice !== '') {
    query.maxPrice = filters.maxPrice;
  }

  return query;
};

export const ProductListView = () => {
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 12 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isActive = true;

    const loadCategories = async () => {
      setIsCategoriesLoading(true);
      setCategoryError(null);

      try {
        const response = await categoryApi.getCategories();
        if (!isActive) {
          return;
        }

        setCategories(response?.data?.categories || []);
      } catch (err) {
        if (!isActive) {
          return;
        }

        setCategories([]);
        setCategoryError(err?.message || 'Unable to load categories.');
      } finally {
        if (isActive) {
          setIsCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await productApi.getProducts(toProductQuery(appliedFilters, page));
        if (!isActive) {
          return;
        }

        setProducts(response?.data?.items || []);
        setPagination(response?.data?.pagination || { page, totalPages: 1, total: 0, limit: 12 });
      } catch (err) {
        if (!isActive) {
          return;
        }

        setProducts([]);
        setPagination({ page, totalPages: 1, total: 0, limit: 12 });
        setError(err?.message || 'Unable to load products.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isActive = false;
    };
  }, [appliedFilters, page]);

  const handleFieldChange = (field, value) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  };

  const handleClear = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const handleRetry = () => {
    setPage(1);
    setAppliedFilters({ ...draftFilters });
  };

  return (
    <VStack
      style={{
        width: '100%',
        gap: 'var(--spacing-6)',
        maxWidth: '1200px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)'
      }}
    >
      <VStack gap={1}>
        <Heading level={1}>Products</Heading>
        <Text color="secondary">
          Search the catalog by keyword, category, and price range.
        </Text>
      </VStack>

      {categoryError && (
        <Alert
          title="Category filter unavailable"
          description={categoryError}
          actionLabel="Retry categories"
          onAction={() => {
            setIsCategoriesLoading(true);
            setCategoryError(null);
            categoryApi.getCategories()
              .then((response) => setCategories(response?.data?.categories || []))
              .catch((err) => setCategoryError(err?.message || 'Unable to load categories.'))
              .finally(() => setIsCategoriesLoading(false));
          }}
        />
      )}

      <ProductFilter
        filters={draftFilters}
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onClear={handleClear}
        isDisabled={isLoading}
      />

      <ProductList
        products={products}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        emptyTitle="No products match your filters"
        emptyDescription="Clear the current filters or broaden the search terms to see more catalog items."
        pagination={pagination}
        onPageChange={setPage}
      />
    </VStack>
  );
};

export default ProductListView;
