import React, { useCallback, useEffect, useState } from 'react';
import { VStack } from '@astryxdesign/core';
import { categoryApi } from '../api/categoryApi';
import { storefrontContentApi } from '../api/storefrontContentApi';
import Alert from '../components/common/Alert';
import HomeCategoryShowcase from '../components/home/HomeCategoryShowcase';
import HomeHero from '../components/home/HomeHero';
import HomeSkeleton from '../components/home/HomeSkeleton';

export const HomeView = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHomeData = useCallback(async (isActive = () => true) => {
    setIsLoading(true);
    setError(null);

    try {
      const [featuredResponse, categoryResponse, carouselResponse] = await Promise.all([
        storefrontContentApi.getFeaturedProducts(),
        categoryApi.getCategories(),
        storefrontContentApi.getCarousel().catch(() => ({ data: { slides: [] } }))
      ]);

      if (!isActive()) {
        return;
      }

      setProducts(featuredResponse?.data?.items || []);
      setCategories(categoryResponse?.data?.categories || []);
      setCarouselSlides(carouselResponse?.data?.slides || []);
    } catch (err) {
      if (!isActive()) {
        return;
      }

      setProducts([]);
      setCategories([]);
      setCarouselSlides([]);
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
          <HomeHero slides={carouselSlides} />
          <HomeCategoryShowcase categories={categories} products={products} />
        </>
      )}
    </VStack>
  );
};

export default HomeView;
