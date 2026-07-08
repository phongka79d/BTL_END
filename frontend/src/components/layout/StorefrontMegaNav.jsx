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
  const [navigationItems, setNavigationItems] = useState([]);

  useEffect(() => {
    let isActive = true;

    storefrontContentApi.getNavigation()
      .then((response) => {
        if (isActive) {
          setNavigationItems(response?.data?.items || []);
        }
      })
      .catch(() => {
        if (isActive) {
          setNavigationItems([]);
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
