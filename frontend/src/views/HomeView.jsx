import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  Icon
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';
import { productApi } from '../api/productApi';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import ProductList from '../components/product/ProductList';

const featuredQuery = {
  page: 1,
  limit: 4
};

export const HomeView = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadFeaturedProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await productApi.getProducts(featuredQuery);
        if (!isActive) {
          return;
        }

        setFeaturedProducts(response?.data?.items || []);
        setPagination(response?.data?.pagination || null);
      } catch (err) {
        if (!isActive) {
          return;
        }

        setError(err?.message || 'Unable to load featured products.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadFeaturedProducts();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <VStack
      style={{
        gap: 'var(--spacing-8)',
        maxWidth: '1200px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)',
        width: '100%'
      }}
    >
      <Card
        style={{
          padding: 'var(--spacing-8)',
          background: 'linear-gradient(135deg, var(--color-background-surface) 0%, var(--color-overlay-hover) 100%)',
          borderRadius: 'var(--radius-container)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--elevation-2)'
        }}
      >
        <VStack gap={4} style={{ maxWidth: '640px' }}>
          <HStack style={{ alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <Icon icon="wrench" color="accent" size="lg" />
            <Text weight="semibold" color="accent" size="supporting">
              TechMart Electronics
            </Text>
          </HStack>

          <Heading level={1} style={{ fontSize: 'var(--text-title-1-size)', fontWeight: 'var(--font-weight-bold)' }}>
            Electronics worth comparing
          </Heading>

          <Text size="body" color="secondary">
            Browse the catalog, narrow results with filters, and move into product detail when you are ready.
          </Text>

          <HStack gap={3} style={{ flexWrap: 'wrap' }}>
            <Button
              label="Browse products"
              variant="primary"
              onClick={() => navigate('/products')}
            />
            {isAuthenticated ? (
              <>
                <Button
                  label="View profile"
                  variant="secondary"
                  onClick={() => navigate('/profile')}
                />
                {user?.role === 'admin' && (
                  <Button
                    label="Admin console"
                    variant="secondary"
                    onClick={() => navigate('/admin')}
                  />
                )}
              </>
            ) : (
              <>
                <Button
                  label="Sign in"
                  variant="secondary"
                  onClick={() => navigate('/login')}
                />
                <Button
                  label="Create account"
                  variant="secondary"
                  onClick={() => navigate('/register')}
                />
              </>
            )}
          </HStack>
        </VStack>
      </Card>

      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Featured products</Heading>
          <Text color="secondary">Latest items from the live catalog.</Text>
        </VStack>

        {isLoading ? (
          <Loading count={4} />
        ) : error ? (
          <Alert
            title="Unable to load featured products"
            description={error}
            actionLabel="Retry"
            onAction={() => {
              setIsLoading(true);
              setError(null);
              productApi.getProducts(featuredQuery)
                .then((response) => {
                  setFeaturedProducts(response?.data?.items || []);
                  setPagination(response?.data?.pagination || null);
                })
                .catch((err) => {
                  setError(err?.message || 'Unable to load featured products.');
                })
                .finally(() => setIsLoading(false));
            }}
          />
        ) : (
          <ProductList
            products={featuredProducts}
            pagination={pagination}
            emptyTitle="No featured products yet"
            emptyDescription="Add catalog items to surface them on the home page."
            skeletonCount={4}
          />
        )}
      </VStack>
    </VStack>
  );
};

export default HomeView;
