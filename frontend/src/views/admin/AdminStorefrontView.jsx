import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  Button,
  Heading,
  HStack,
  Tab,
  TabList,
  Text,
  Toolbar,
  VStack
} from '@astryxdesign/core';
import { categoryApi } from '../../api/categoryApi';
import { productApi } from '../../api/productApi';
import { storefrontContentApi } from '../../api/storefrontContentApi';
import CarouselSlideForm from '../../components/admin/storefront/CarouselSlideForm';
import CarouselSlideTable from '../../components/admin/storefront/CarouselSlideTable';
import NavigationItemForm from '../../components/admin/storefront/NavigationItemForm';
import NavigationItemTable from '../../components/admin/storefront/NavigationItemTable';
import Alert from '../../components/common/Alert';

export const AdminStorefrontView = () => {
  const [activeTab, setActiveTab] = useState('carousel');
  const [slides, setSlides] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [editingNavItem, setEditingNavItem] = useState(null);
  const [childParent, setChildParent] = useState(null);
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [isNavFormOpen, setIsNavFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadStorefront = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [slideResponse, navResponse, productResponse, categoryResponse] = await Promise.all([
        storefrontContentApi.getAdminCarousel(),
        storefrontContentApi.getAdminNavigation(),
        productApi.getProducts({ page: 1, limit: 100 }),
        categoryApi.getCategories(),
      ]);
      setSlides(slideResponse?.data?.slides || []);
      setNavItems(navResponse?.data?.items || []);
      setProducts(productResponse?.data?.items || []);
      setCategories(categoryResponse?.data?.categories || []);
    } catch (error) {
      setSlides([]);
      setNavItems([]);
      setProducts([]);
      setCategories([]);
      setLoadError(error?.message || 'Unable to load storefront content.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStorefront();
  }, [loadStorefront]);

  const topLevelMegaMenus = useMemo(
    () => navItems.filter((item) => !item.parentId && item.itemType === 'mega_menu'),
    [navItems]
  );

  const openCreateSlide = () => {
    setEditingSlide(null);
    setIsSlideFormOpen(true);
  };

  const openCreateNavItem = () => {
    setEditingNavItem(null);
    setChildParent(null);
    setIsNavFormOpen(true);
  };

  const openCreateChild = (parent) => {
    setEditingNavItem({ parentId: parent.id, itemType: 'link' });
    setChildParent(parent);
    setIsNavFormOpen(true);
  };

  const saveSlide = async (payload) => {
    if (editingSlide?.id) {
      await storefrontContentApi.updateCarouselSlide(editingSlide.id, payload);
      setFeedback({ title: 'Slide updated', description: `${payload.title} was updated.` });
    } else {
      await storefrontContentApi.createCarouselSlide(payload);
      setFeedback({ title: 'Slide created', description: `${payload.title} was created.` });
    }
    await loadStorefront();
  };

  const saveNavItem = async (payload) => {
    const nextPayload = childParent ? { ...payload, parentId: childParent.id, itemType: 'link' } : payload;
    if (editingNavItem?.id) {
      await storefrontContentApi.updateNavigationItem(editingNavItem.id, nextPayload);
      setFeedback({ title: 'Navigation item updated', description: `${nextPayload.label} was updated.` });
    } else {
      await storefrontContentApi.createNavigationItem(nextPayload);
      setFeedback({ title: 'Navigation item created', description: `${nextPayload.label} was created.` });
    }
    await loadStorefront();
  };

  const toggleSlideActive = async (slide) => {
    await storefrontContentApi.updateCarouselSlide(slide.id, { ...slide, isActive: !slide.isActive });
    await loadStorefront();
  };

  const toggleNavActive = async (item) => {
    await storefrontContentApi.updateNavigationItem(item.id, { ...item, isActive: !item.isActive });
    await loadStorefront();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === 'slide') {
        await storefrontContentApi.deleteCarouselSlide(deleteTarget.item.id);
      } else {
        await storefrontContentApi.deleteNavigationItem(deleteTarget.item.id);
      }
      setDeleteTarget(null);
      setFeedback({ title: 'Storefront content deleted', description: 'The item was removed from storefront configuration.' });
      await loadStorefront();
    } catch (error) {
      setFeedback({ title: 'Unable to delete item', description: error?.message || 'The storefront item could not be deleted.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <VStack gap={6} width="100%">
      <HStack gap={4} align="center" justify="between" wrap="wrap" width="100%">
        <VStack gap={1}>
          <Heading level={1}>Storefront</Heading>
          <Text color="secondary">Manage homepage carousel slides and customer navigation.</Text>
        </VStack>
        <Button label="Refresh" variant="secondary" onClick={loadStorefront} isDisabled={isLoading} />
      </HStack>

      {feedback && <Alert title={feedback.title} description={feedback.description} />}

      <TabList value={activeTab} onChange={setActiveTab} aria-label="Storefront sections">
        <Tab value="carousel" label="Carousel" />
        <Tab value="navigation" label="Navigation" />
      </TabList>

      {activeTab === 'carousel' && (
        <VStack gap={4}>
          <Toolbar label="Carousel manager" endContent={<Button label="Create slide" variant="primary" onClick={openCreateSlide} />} />
          <CarouselSlideTable
            slides={slides}
            isLoading={isLoading}
            error={loadError}
            isDeleting={isDeleting}
            onCreate={openCreateSlide}
            onEdit={(slide) => { setEditingSlide(slide); setIsSlideFormOpen(true); }}
            onToggleActive={toggleSlideActive}
            onDelete={(slide) => setDeleteTarget({ kind: 'slide', item: slide })}
            onRetry={loadStorefront}
          />
        </VStack>
      )}

      {activeTab === 'navigation' && (
        <VStack gap={4}>
          <Toolbar label="Navigation manager" endContent={<Button label="Create navigation item" variant="primary" onClick={openCreateNavItem} />} />
          <NavigationItemTable
            items={navItems}
            isLoading={isLoading}
            error={loadError}
            isDeleting={isDeleting}
            onCreate={openCreateNavItem}
            onCreateChild={openCreateChild}
            onEdit={(item) => { setEditingNavItem(item); setChildParent(null); setIsNavFormOpen(true); }}
            onToggleActive={toggleNavActive}
            onDelete={(item) => setDeleteTarget({ kind: 'nav', item })}
            onRetry={loadStorefront}
          />
        </VStack>
      )}

      <CarouselSlideForm
        categories={categories}
        isOpen={isSlideFormOpen}
        onOpenChange={setIsSlideFormOpen}
        onSubmit={saveSlide}
        products={products}
        slide={editingSlide}
      />
      <NavigationItemForm
        categories={categories}
        isOpen={isNavFormOpen}
        items={navItems}
        onOpenChange={setIsNavFormOpen}
        onSubmit={saveNavItem}
        parentOptions={topLevelMegaMenus}
        products={products}
        item={editingNavItem}
      />
      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setDeleteTarget(null);
        }}
        title="Delete storefront item?"
        description={deleteTarget ? `${deleteTarget.item.label || deleteTarget.item.title} will be removed from storefront configuration.` : 'This item will be removed.'}
        actionLabel="Delete item"
        isActionLoading={isDeleting}
        onAction={confirmDelete}
      />
    </VStack>
  );
};

export default AdminStorefrontView;
