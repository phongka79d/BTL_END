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
import { resolveStorefrontHref } from '../storefront/storefrontLinkUtils';

const heroSlidesLimit = 6;
const rotationDelayMs = 5000;
const heroContentInset = 'clamp(calc(var(--spacing-8) + var(--spacing-4)), 7vw, calc(var(--spacing-8) * 3))';
const heroControlInset = 'var(--spacing-5)';
const progressAnimationName = 'home-hero-progress';

const getNextIndex = (currentIndex, slideCount) => (
  slideCount === 0 ? 0 : (currentIndex + 1) % slideCount
);

const getPreviousIndex = (currentIndex, slideCount) => (
  slideCount === 0 ? 0 : (currentIndex - 1 + slideCount) % slideCount
);

const HomeHeroSlide = ({ isActive, slide }) => {
  const navigate = useNavigate();
  const href = resolveStorefrontHref(slide.linkTarget);

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
        backgroundImage: `linear-gradient(90deg, var(--color-background-surface) 0%, color-mix(in srgb, var(--color-background-surface) 84%, transparent) 44%, color-mix(in srgb, var(--color-background-surface) 22%, transparent) 100%), url("${slide.imageUrl}")`,
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
          <Badge variant="blue" label="Nổi bật" />
          <Heading
            level={1}
            style={{
              fontSize: 'var(--text-heading-1-size)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {slide.title}
          </Heading>
          {slide.description && (
            <Text color="secondary">{slide.description}</Text>
          )}
        </VStack>

        <HStack gap={3} style={{ flexWrap: 'wrap' }}>
          <Button
            label={slide.primaryButtonLabel}
            variant="primary"
            onClick={() => navigate(href)}
          />
          <Button
            label="Xem danh mục"
            variant="secondary"
            onClick={() => navigate('/products')}
          />
        </HStack>
      </VStack>
    </VStack>
  );
};

export const HomeHero = ({ slides = [] }) => {
  const navigate = useNavigate();
  const heroSlides = slides.slice(0, heroSlidesLimit);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const hasMultipleSlides = heroSlides.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides || isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => getNextIndex(currentIndex, heroSlides.length));
    }, rotationDelayMs);

    return () => window.clearInterval(intervalId);
  }, [hasMultipleSlides, heroSlides.length, isPaused]);

  useEffect(() => {
    setActiveIndex((currentIndex) => (
      currentIndex >= heroSlides.length ? 0 : currentIndex
    ));
  }, [heroSlides.length]);

  const showPreviousSlide = useCallback(() => {
    setActiveIndex((currentIndex) => getPreviousIndex(currentIndex, heroSlides.length));
  }, [heroSlides.length]);

  const showNextSlide = useCallback(() => {
    setActiveIndex((currentIndex) => getNextIndex(currentIndex, heroSlides.length));
  }, [heroSlides.length]);

  if (heroSlides.length === 0) {
    return (
      <Card
        variant="muted"
        padding={6}
        width="100%"
        height="calc(var(--spacing-8) * 11)"
        style={{ '--_card-radius': 'var(--radius-container)' }}
      >
        <VStack gap={4} style={{ height: '100%', justifyContent: 'center' }}>
          <Heading level={1}>Băng chuyền cửa hàng đã sẵn sàng cho các slide</Heading>
          <Text color="secondary">
            Thêm các slide đang kích hoạt trong trình quản lý cửa hàng để xuất bản nội dung băng chuyền trang chủ.
          </Text>
          <HStack gap={3}>
            <Button label="Xem sản phẩm" variant="primary" onClick={() => navigate('/products')} />
            <Button label="Quản lý cửa hàng" variant="secondary" onClick={() => navigate('/admin/storefront')} />
          </HStack>
        </VStack>
      </Card>
    );
  }

  return (
    <VStack
      aria-label="Băng chuyền nổi bật"
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

      {heroSlides.map((slide, index) => (
        <HomeHeroSlide
          key={slide.id}
          isActive={index === activeIndex}
          slide={slide}
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
              label="Slide trước"
              tooltip="Trước"
              variant="secondary"
              icon={<Icon icon="chevronLeft" size="sm" />}
              onClick={showPreviousSlide}
              style={{ pointerEvents: 'auto' }}
            />
            <IconButton
              label="Slide sau"
              tooltip="Sau"
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
            {heroSlides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`Show ${slide.title}`}
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
