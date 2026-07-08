import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Icon,
  TopNavItem,
  TopNavMegaMenu,
  TopNavMegaMenuFeaturedCard,
  TopNavMegaMenuItem
} from '@astryxdesign/core';
import { storefrontContentApi } from '../../api/storefrontContentApi';
import { resolveStorefrontHref } from '../storefront/storefrontLinkUtils';

export const fallbackStorefrontNavigation = [
  {
    id: 'fallback-shop',
    label: 'Shop',
    itemType: 'mega_menu',
    sortOrder: 1,
    featured: {
      title: 'Featured products',
      description: 'Browse the current catalog.',
      imageUrl: 'https://lookaside.facebook.com/assets/astryx/texture-beige-horizontal-1.png',
      linkLabel: 'Shop catalog',
      linkTarget: { type: 'customUrl', customUrl: '/products' }
    },
    children: [
      {
        id: 'fallback-new',
        label: 'New Arrivals',
        description: 'Latest products',
        icon: 'success',
        linkTarget: { type: 'customUrl', customUrl: '/products' },
        sortOrder: 1
      },
      {
        id: 'fallback-sale',
        label: 'Sale',
        description: 'Browse current offers',
        icon: 'warning',
        linkTarget: { type: 'customUrl', customUrl: '/products' },
        sortOrder: 2
      }
    ]
  },
  {
    id: 'fallback-products',
    label: 'Products',
    itemType: 'link',
    linkTarget: { type: 'customUrl', customUrl: '/products' },
    sortOrder: 2
  }
];

const MegaMenuItems = ({ items }) => (
  <Grid columns={{ minWidth: 220, max: 2 }} gap={2}>
    {items.map((item) => (
      <TopNavMegaMenuItem
        key={item.id}
        title={item.label}
        description={item.description || ''}
        icon={<Icon icon={item.icon || 'info'} size="sm" color="secondary" />}
        href={resolveStorefrontHref(item.linkTarget)}
        as={Link}
      />
    ))}
  </Grid>
);

const MegaMenuFeatured = ({ featured }) => (
  featured ? (
    <TopNavMegaMenuFeaturedCard
      title={featured.title}
      description={featured.description || ''}
      image={featured.imageUrl}
      imageAlt={featured.title}
      linkLabel={featured.linkLabel}
      linkHref={resolveStorefrontHref(featured.linkTarget)}
    />
  ) : undefined
);

export const StorefrontMegaNav = () => {
  const [navigationItems, setNavigationItems] = useState(fallbackStorefrontNavigation);

  useEffect(() => {
    let isActive = true;

    storefrontContentApi.getNavigation()
      .then((response) => {
        if (isActive) {
          setNavigationItems(response?.data?.items || fallbackStorefrontNavigation);
        }
      })
      .catch(() => {
        if (isActive) {
          setNavigationItems(fallbackStorefrontNavigation);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      {navigationItems.map((item) => (
        item.itemType === 'mega_menu' ? (
          <TopNavMegaMenu
            key={item.id}
            label={item.label}
            items={<MegaMenuItems items={item.children || []} />}
            featured={<MegaMenuFeatured featured={item.featured} />}
          />
        ) : (
          <TopNavItem
            key={item.id}
            label={item.label}
            href={resolveStorefrontHref(item.linkTarget)}
            as={Link}
          />
        )
      ))}
    </>
  );
};

export default StorefrontMegaNav;
