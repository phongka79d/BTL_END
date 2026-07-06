import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Icon,
  TopNavItem,
  TopNavMegaMenu,
  TopNavMegaMenuFeaturedCard,
  TopNavMegaMenuItem
} from '@astryxdesign/core';

const shopItems = [
  { title: 'New Arrivals', description: 'The latest drops', icon: 'success' },
  { title: 'Womenswear', description: 'Dresses, knitwear & more', icon: 'copy' },
  { title: 'Menswear', description: 'Shirts, tailoring & more', icon: 'wrench' },
  { title: 'Home', description: 'Bedding, lighting & decor', icon: 'info' },
  { title: 'Beauty', description: 'Skincare, fragrance & makeup', icon: 'success' },
  { title: 'Accessories', description: 'Bags, hats & sunglasses', icon: 'copy' },
  { title: 'Sale', description: 'Up to 50% off', icon: 'warning' },
  { title: 'Gift Cards', description: 'The perfect present', icon: 'check' }
];

const brandItems = [
  { title: 'Aether', description: 'Performance essentials', icon: 'success' },
  { title: 'Northwind', description: 'Outdoor & technical', icon: 'info' },
  { title: 'Loomwell', description: 'Everyday knitwear', icon: 'wrench' },
  { title: 'Verdant', description: 'Sustainable basics', icon: 'check' },
  { title: 'Studio Mara', description: 'Modern tailoring', icon: 'copy' },
  { title: 'Atelier Kos', description: 'Limited ateliers', icon: 'warning' },
  { title: 'Rue & Co', description: 'City streetwear', icon: 'externalLink' },
  { title: 'Halden', description: 'Minimal staples', icon: 'info' }
];

const MegaMenuItems = ({ items }) => (
  <Grid columns={{ minWidth: 220, max: 2 }} gap={2}>
    {items.map((item) => (
      <TopNavMegaMenuItem
        key={item.title}
        title={item.title}
        description={item.description}
        icon={<Icon icon={item.icon} size="sm" color="secondary" />}
        href="/products"
        as={Link}
      />
    ))}
  </Grid>
);

export const StorefrontMegaNav = () => {
  return (
    <>
      <TopNavMegaMenu
        label="Shop"
        items={<MegaMenuItems items={shopItems} />}
        featured={
          <TopNavMegaMenuFeaturedCard
            title="The Autumn Edit"
            description="Layering staples in warm, earthy tones."
            image="https://lookaside.facebook.com/assets/astryx/texture-beige-horizontal-1.png"
            imageAlt="Autumn collection lookbook"
            linkLabel="Shop the edit"
            linkHref="/products"
          />
        }
      />
      <TopNavMegaMenu
        label="Brands"
        items={<MegaMenuItems items={brandItems} />}
        featured={
          <TopNavMegaMenuFeaturedCard
            title="Meet Studio Mara"
            description="Modern tailoring, made to last."
            image="https://lookaside.facebook.com/assets/astryx/texture-beige-horizontal-2.png"
            imageAlt="Studio Mara lookbook"
            linkLabel="Discover the label"
            linkHref="/products"
          />
        }
      />
      <TopNavItem label="Sale" href="/products" as={Link} />
      <TopNavItem label="Service" href="/products" as={Link} />
    </>
  );
};

export default StorefrontMegaNav;
