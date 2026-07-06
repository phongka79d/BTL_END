import React, { useCallback, useEffect, useState } from 'react';
import { VStack } from '@astryxdesign/core';
import { categoryApi } from '../api/categoryApi';
import { productApi } from '../api/productApi';
import Alert from '../components/common/Alert';
import HomeCategoryShowcase from '../components/home/HomeCategoryShowcase';
import { homeProductQuery } from '../components/home/homeContent';
import HomeHero from '../components/home/HomeHero';
import HomeSkeleton from '../components/home/HomeSkeleton';

export const HomeView = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHomeData = useCallback(async (isActive = () => true) => {
    setIsLoading(true);
    setError(null);

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        productApi.getProducts(homeProductQuery),
        categoryApi.getCategories()
      ]);

      if (!isActive()) {
        return;
      }

      setProducts(productResponse?.data?.items || []);
      setCategories(categoryResponse?.data?.categories || []);
    } catch (err) {
      if (!isActive()) {
        return;
      }

      setProducts([]);
      setCategories([]);
      setError(err?.message || 'Unable to load storefront data.');
    } finally {
      if (isActive()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    loadHomeData(() => isActive);

    return () => {
      isActive = false;
    };
  }, [loadHomeData]);

  return (
    <VStack
      gap={10}
      style={{
        maxWidth: 'calc(var(--spacing-8) * 137.5)',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-8)',
        width: '100%'
      }}
    >
      {isLoading ? (
        <HomeSkeleton />
      ) : error ? (
        <Alert
          title="Unable to load storefront"
          description={error}
          actionLabel="Retry"
          onAction={() => loadHomeData()}
        />
      ) : (
        <>
          <HomeHero products={products} />
          <HomeCategoryShowcase categories={categories} products={products} />
        </>
      )}
    </VStack>
  );
};

export default HomeView;
