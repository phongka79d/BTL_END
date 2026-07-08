import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  HStack,
  Heading,
  Icon,
  IconButton,
  Text,
  VStack
} from '@astryxdesign/core';
import { formatPrice, getProductImageSrc } from '../product/productUtils';

const heroProductsLimit = 4;
const rotationDelayMs = 5000;
const heroContentInset = 'clamp(calc(var(--spacing-8) + var(--spacing-4)), 7vw, calc(var(--spacing-8) * 3))';
const heroControlInset = 'var(--spacing-5)';
const progressAnimationName = 'home-hero-progress';

const getNextIndex = (currentIndex, productCount) => (
  productCount === 0 ? 0 : (currentIndex + 1) % productCount
);

const getPreviousIndex = (currentIndex, productCount) => (
  productCount === 0 ? 0 : (currentIndex - 1 + productCount) % productCount
);

const HomeHeroSlide = ({ isActive, product }) => {
  const navigate = useNavigate();

  return (
    <VStack
      aria-hidden={!isActive}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
        transform: isActive ? 'translateX(0)' : 'translateX(var(--spacing-4))',
        transition:
          'opacity var(--duration-medium) var(--ease-standard), transform var(--duration-medium) var(--ease-standard)',
        backgroundImage: `linear-gradient(90deg, var(--color-background-surface) 0%, color-mix(in srgb, var(--color-background-surface) 84%, transparent) 44%, color-mix(in srgb, var(--color-background-surface) 22%, transparent) 100%), url("${getProductImageSrc(product.imageUrl)}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <VStack
        gap={5}
        style={{
          height: '100%',
          justifyContent: 'center',
          maxWidth: 'calc(var(--spacing-8) * 19)',
          paddingInline: heroContentInset
        }}
      >
        <VStack gap={3}>
          <HStack gap={2} style={{ flexWrap: 'wrap' }}>
            <Badge variant="blue" label={product.category?.name || 'Uncategorized'} />
            <Badge variant="green" label={product.brand || 'Featured'} />
          </HStack>
          <Heading
            level={1}
            style={{
              fontSize: 'var(--text-title-1-size)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {product.name}
          </Heading>
          {product.description && (
            <Text color="secondary">{product.description}</Text>
          )}
          <Text color="accent" weight="semibold">
            {formatPrice(product.price)}
          </Text>
        </VStack>

        <HStack gap={3} style={{ flexWrap: 'wrap' }}>
          <Button
            label="View product"
            variant="primary"
            onClick={() => navigate(`/products/${product.id}`)}
          />
          <Button
            label="Browse catalog"
            variant="secondary"
            onClick={() => navigate('/products')}
          />
        </HStack>
      </VStack>
    </VStack>
  );
};

export const HomeHero = ({ products = [] }) => {
  const navigate = useNavigate();
  const heroProducts = products.slice(0, heroProductsLimit);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const hasMultipleSlides = heroProducts.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides || isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => getNextIndex(currentIndex, heroProducts.length));
    }, rotationDelayMs);

    return () => window.clearInterval(intervalId);
  }, [hasMultipleSlides, heroProducts.length, isPaused]);

  useEffect(() => {
    setActiveIndex((currentIndex) => (
      currentIndex >= heroProducts.length ? 0 : currentIndex
    ));
  }, [heroProducts.length]);

  const showPreviousSlide = useCallback(() => {
    setActiveIndex((currentIndex) => getPreviousIndex(currentIndex, heroProducts.length));
  }, [heroProducts.length]);

  const showNextSlide = useCallback(() => {
    setActiveIndex((currentIndex) => getNextIndex(currentIndex, heroProducts.length));
  }, [heroProducts.length]);

  if (heroProducts.length === 0) {
    return (
      <Card
        variant="muted"
        padding={6}
        width="100%"
        height="calc(var(--spacing-8) * 11)"
        style={{ '--_card-radius': 'var(--radius-container)' }}
      >
        <VStack gap={4} style={{ height: '100%', justifyContent: 'center' }}>
          <Heading level={1}>Catalog ready for your next feature product</Heading>
          <Text color="secondary">
            Add products in the admin console to populate this storefront from live app data.
          </Text>
          <HStack gap={3}>
            <Button label="Browse products" variant="primary" onClick={() => navigate('/products')} />
            <Button label="Manage catalog" variant="secondary" onClick={() => navigate('/admin/products')} />
          </HStack>
        </VStack>
      </Card>
    );
  }

  return (
    <VStack
      aria-label="Featured product carousel"
      role="region"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      onFocusCapture={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(var(--spacing-8) * 11)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-container)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-background-muted)'
      }}
    >
      <style>
        {`
          @keyframes ${progressAnimationName} {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}
      </style>

      {heroProducts.map((product, index) => (
        <HomeHeroSlide
          key={product.id}
          isActive={index === activeIndex}
          product={product}
        />
      ))}

      {hasMultipleSlides && (
        <>
          <HStack
            style={{
              position: 'absolute',
              insetInline: heroControlInset,
              top: '50%',
              justifyContent: 'space-between',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          >
            <IconButton
              label="Previous featured product"
              tooltip="Previous"
              variant="secondary"
              icon={<Icon icon="chevronLeft" size="sm" />}
              onClick={showPreviousSlide}
              style={{ pointerEvents: 'auto' }}
            />
            <IconButton
              label="Next featured product"
              tooltip="Next"
              variant="secondary"
              icon={<Icon icon="chevronRight" size="sm" />}
              onClick={showNextSlide}
              style={{ pointerEvents: 'auto' }}
            />
          </HStack>

          <HStack
            gap={1}
            style={{
              position: 'absolute',
              insetInline: 0,
              bottom: 'var(--spacing-4)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {heroProducts.map((product, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={product.id}
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`Show ${product.name}`}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    appearance: 'none',
                    padding: 0,
                    width: isActive ? 'var(--spacing-6)' : 'var(--spacing-3)',
                    minWidth: isActive ? 'var(--spacing-6)' : 'var(--spacing-3)',
                    height: 'var(--spacing-3)',
                    position: 'relative',
                    display: 'block',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--color-text-primary) 42%, transparent)'
                      : 'color-mix(in srgb, var(--color-text-primary) 35%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-text-primary) 28%, transparent)',
                    cursor: 'pointer',
                    transition:
                      'width var(--duration-short) var(--ease-standard), background-color var(--duration-short) var(--ease-standard)'
                  }}
                >
                  {isActive && (
                    <VStack
                      aria-hidden
                      key={`${activeIndex}-${isPaused ? 'paused' : 'running'}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-text-primary)',
                        transformOrigin: 'left',
                        transform: 'scaleX(0)',
                        animation: isPaused
                          ? 'none'
                          : `${progressAnimationName} ${rotationDelayMs}ms linear forwards`
                      }}
                    />
                  )}
                </button>
              );
            })}
          </HStack>
        </>
      )}
    </VStack>
  );
};

export default HomeHero;
