import React, { useCallback, useEffect, useState } from 'react';
import { VStack } from '@astryxdesign/core';
import { productApi } from '../api/productApi';
import { storefrontContentApi } from '../api/storefrontContentApi';
import Alert from '../components/common/Alert';
import HomeAllProductsSection from '../components/home/HomeAllProductsSection';
import HomeCategoryShowcase from '../components/home/HomeCategoryShowcase';
import HomeHero from '../components/home/HomeHero';
import HomeSkeleton from '../components/home/HomeSkeleton';

const allProductsPageSize = 12;

export const HomeView = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allProductsPagination, setAllProductsPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: allProductsPageSize });
  const [allProductsPage, setAllProductsPage] = useState(1);
  const [allProductSort, setAllProductSort] = useState('default');
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAllProductsLoading, setIsAllProductsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProductsError, setAllProductsError] = useState(null);
  const [allProductsReloadKey, setAllProductsReloadKey] = useState(0);

  const loadHomeData = useCallback(async (isActive = () => true) => {
    setIsLoading(true);
    setError(null);

    try {
      const [featuredResponse, carouselResponse] = await Promise.all([
        storefrontContentApi.getFeaturedProducts(),
        storefrontContentApi.getCarousel().catch(() => ({ data: { slides: [] } }))
      ]);

      if (!isActive()) {
        return;
      }

      setFeaturedProducts(featuredResponse?.data?.items || []);
      setCarouselSlides(carouselResponse?.data?.slides || []);
    } catch (err) {
      if (!isActive()) {
        return;
      }

      setFeaturedProducts([]);
      setCarouselSlides([]);
      setError(err?.message || 'Unable to load storefront data.');
    } finally {
      if (isActive()) {
        setIsLoading(false);
      }
    }
  }, []);

  const loadAllProducts = useCallback(async (page = 1, isActive = () => true) => {
    setIsAllProductsLoading(true);
    setAllProductsError(null);

    try {
      const response = await productApi.getProducts({ page, limit: allProductsPageSize, sort: allProductSort });
      if (!isActive()) {
        return;
      }

      const nextProducts = response?.data?.items || [];
      setAllProducts(nextProducts);
      setAllProductsPagination(response?.data?.pagination || { page, totalPages: 1, total: 0, limit: allProductsPageSize });
    } catch (err) {
      if (!isActive()) {
        return;
      }

      setAllProducts([]);
      setAllProductsError(err?.message || 'Unable to load products.');
    } finally {
      if (isActive()) {
        setIsAllProductsLoading(false);
      }
    }
  }, [allProductSort]);

  useEffect(() => {
    let isActive = true;

    loadHomeData(() => isActive);

    return () => {
      isActive = false;
    };
  }, [loadHomeData]);

  useEffect(() => {
    let isActive = true;

    loadAllProducts(allProductsPage, () => isActive);

    return () => {
      isActive = false;
    };
  }, [allProductSort, allProductsPage, allProductsReloadKey, loadAllProducts]);

  const handleAllProductSortChange = (nextSort) => {
    if (nextSort !== allProductSort) {
      setAllProductsPage(1);
      setAllProductSort(nextSort);
    }
  };

  const handleAllProductsRetry = () => {
    setAllProductsReloadKey((current) => current + 1);
  };

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
          <HomeHero slides={carouselSlides} />
          <HomeCategoryShowcase products={featuredProducts} />
          <HomeAllProductsSection
            products={allProducts}
            sort={allProductSort}
            isLoading={isAllProductsLoading}
            error={allProductsError}
            pagination={allProductsPagination}
            onSortChange={handleAllProductSortChange}
            onPageChange={setAllProductsPage}
            onRetry={handleAllProductsRetry}
          />
        </>
      )}
    </VStack>
  );
};

export default HomeView;
