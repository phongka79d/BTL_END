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
import { storefrontContentApi } from '../../api/storefrontContentApi';
import CarouselSlideForm from '../../components/admin/storefront/CarouselSlideForm';
import CarouselSlideTable from '../../components/admin/storefront/CarouselSlideTable';
import NavigationItemForm from '../../components/admin/storefront/NavigationItemForm';
import NavigationItemTable from '../../components/admin/storefront/NavigationItemTable';
import Alert from '../../components/common/Alert';
import FeaturedProductManager from '../../components/admin/storefront/FeaturedProductManager';

const defaultFeaturedSettings = {
  featuredProductLimit: 6
};

export const AdminStorefrontView = () => {
  const [activeTab, setActiveTab] = useState('carousel');
  const [slides, setSlides] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredSettings, setFeaturedSettings] = useState(defaultFeaturedSettings);
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
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);

  const loadStorefront = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [slideResponse, navResponse, featuredResponse, categoryResponse] = await Promise.all([
        storefrontContentApi.getAdminCarousel(),
        storefrontContentApi.getAdminNavigation(),
        storefrontContentApi.getAdminFeaturedProducts(),
        categoryApi.getCategories(),
      ]);
      setSlides(slideResponse?.data?.slides || []);
      setNavItems(navResponse?.data?.items || []);
      setFeaturedProducts(featuredResponse?.data?.items || []);
      setFeaturedSettings(featuredResponse?.data?.settings || defaultFeaturedSettings);
      setCategories(categoryResponse?.data?.categories || []);
    } catch (error) {
      setSlides([]);
      setNavItems([]);
      setFeaturedProducts([]);
      setFeaturedSettings(defaultFeaturedSettings);
      setCategories([]);
      setLoadError(error?.message || 'Không thể tải nội dung cửa hàng.');
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
      setFeedback({ title: 'Đã cập nhật slide', description: `${payload.title} đã được cập nhật.`, status: 'success' });
    } else {
      await storefrontContentApi.createCarouselSlide(payload);
      setFeedback({ title: 'Đã tạo slide', description: `${payload.title} đã được tạo.`, status: 'success' });
    }
    await loadStorefront();
  };

  const saveNavItem = async (payload) => {
    const nextPayload = childParent ? { ...payload, parentId: childParent.id, itemType: 'link' } : payload;
    if (editingNavItem?.id) {
      await storefrontContentApi.updateNavigationItem(editingNavItem.id, nextPayload);
      setFeedback({ title: 'Đã cập nhật mục điều hướng', description: `${nextPayload.label} đã được cập nhật.`, status: 'success' });
    } else {
      await storefrontContentApi.createNavigationItem(nextPayload);
      setFeedback({ title: 'Đã tạo mục điều hướng', description: `${nextPayload.label} đã được tạo.`, status: 'success' });
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

  const saveFeaturedSettings = async (payload) => {
    setIsSavingFeatured(true);
    try {
      await storefrontContentApi.updateStorefrontSettings(payload);
      setFeedback({ title: 'Đã lưu số lượng sản phẩm nổi bật', description: 'Số lượng sản phẩm nổi bật trên trang chủ đã được cập nhật.', status: 'success' });
      await loadStorefront();
    } catch (error) {
      setFeedback({ title: 'Không thể lưu số lượng nổi bật', description: error?.message || 'Không thể lưu cài đặt cửa hàng.', status: 'error' });
    } finally {
      setIsSavingFeatured(false);
    }
  };

  const createFeaturedProductsBulk = async (payload) => {
    setIsSavingFeatured(true);
    try {
      const response = await storefrontContentApi.createFeaturedProductsBulk(payload);
      const createdCount = response?.data?.items?.length || 0;
      const skippedCount = response?.data?.skippedProductIds?.length || 0;
      setFeedback({
        title: 'Đã thêm sản phẩm nổi bật',
        description: `${createdCount} sản phẩm đã được thêm${skippedCount ? ` và bỏ qua ${skippedCount} sản phẩm trùng lặp` : ''}.`,
        status: 'success'
      });
      await loadStorefront();
    } catch (error) {
      setFeedback({ title: 'Không thể thêm sản phẩm nổi bật', description: error?.message || 'Không thể chọn các sản phẩm đã chọn làm sản phẩm nổi bật.', status: 'error' });
    } finally {
      setIsSavingFeatured(false);
    }
  };

  const updateFeaturedProduct = async (id, payload) => {
    setIsSavingFeatured(true);
    try {
      await storefrontContentApi.updateFeaturedProduct(id, payload);
      await loadStorefront();
    } catch (error) {
      setFeedback({ title: 'Không thể cập nhật sản phẩm nổi bật', description: error?.message || 'Không thể cập nhật sản phẩm nổi bật.', status: 'error' });
    } finally {
      setIsSavingFeatured(false);
    }
  };

  const reorderFeaturedProducts = async (orderedIds) => {
    setIsSavingFeatured(true);
    try {
      await storefrontContentApi.reorderFeaturedProducts(orderedIds);
      await loadStorefront();
    } catch (error) {
      setFeedback({ title: 'Không thể sắp xếp sản phẩm nổi bật', description: error?.message || 'Không thể lưu thứ tự sản phẩm nổi bật.', status: 'error' });
    } finally {
      setIsSavingFeatured(false);
    }
  };

  const toggleFeaturedProduct = async (item) => {
    await updateFeaturedProduct(item.id, {
      productId: item.productId,
      sortOrder: item.sortOrder,
      isActive: !item.isActive,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === 'slide') {
        await storefrontContentApi.deleteCarouselSlide(deleteTarget.item.id);
      } else if (deleteTarget.kind === 'nav') {
        await storefrontContentApi.deleteNavigationItem(deleteTarget.item.id);
      } else {
        await storefrontContentApi.deleteFeaturedProduct(deleteTarget.item.id);
      }
      setDeleteTarget(null);
      setFeedback({ title: 'Đã xóa nội dung cửa hàng', description: 'Mục này đã được xóa khỏi cấu hình cửa hàng.', status: 'success' });
      await loadStorefront();
    } catch (error) {
      setFeedback({ title: 'Không thể xóa mục', description: error?.message || 'Không thể xóa mục khỏi cửa hàng.', status: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <VStack gap={6} width="100%">
      <HStack gap={4} align="center" justify="between" wrap="wrap" width="100%">
        <VStack gap={1}>
          <Heading level={1}>Cửa hàng</Heading>
          <Text color="secondary">Quản lý slide băng chuyền trang chủ và điều hướng khách hàng.</Text>
        </VStack>
        <Button label="Làm mới" variant="secondary" onClick={loadStorefront} isDisabled={isLoading} />
      </HStack>

      {feedback && <Alert title={feedback.title} description={feedback.description} status={feedback.status} />}

      <TabList value={activeTab} onChange={setActiveTab} aria-label="Các phần cửa hàng">
        <Tab value="carousel" label="Băng chuyền" />
        <Tab value="navigation" label="Điều hướng" />
        <Tab value="featuredProducts" label="Sản phẩm nổi bật" />
      </TabList>

      {activeTab === 'carousel' && (
        <VStack gap={4}>
          <Toolbar label="Quản lý băng chuyền" endContent={<Button label="Tạo slide" variant="primary" onClick={openCreateSlide} />} />
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
          <Toolbar label="Quản lý điều hướng" endContent={<Button label="Tạo mục điều hướng" variant="primary" onClick={openCreateNavItem} />} />
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

      {activeTab === 'featuredProducts' && (
        <FeaturedProductManager
          featuredProducts={featuredProducts}
          settings={featuredSettings}
          isLoading={isLoading}
          isSaving={isSavingFeatured || isDeleting}
          error={loadError}
          onCreateFeaturedProductsBulk={createFeaturedProductsBulk}
          onReorderFeaturedProducts={reorderFeaturedProducts}
          onToggleFeaturedProduct={toggleFeaturedProduct}
          onDeleteFeaturedProduct={(item) => setDeleteTarget({ kind: 'featured', item })}
          onSaveSettings={saveFeaturedSettings}
          onRetry={loadStorefront}
        />
      )}

      <CarouselSlideForm
        categories={categories}
        isOpen={isSlideFormOpen}
        onOpenChange={setIsSlideFormOpen}
        onSubmit={saveSlide}
        slide={editingSlide}
      />
      <NavigationItemForm
        categories={categories}
        isOpen={isNavFormOpen}
        items={navItems}
        onOpenChange={setIsNavFormOpen}
        onSubmit={saveNavItem}
        parentOptions={topLevelMegaMenus}
        item={editingNavItem}
      />
      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setDeleteTarget(null);
        }}
        title="Xóa mục cửa hàng?"
        description={deleteTarget ? `${deleteTarget.item.label || deleteTarget.item.title || deleteTarget.item.product?.name || 'Mục này'} sẽ bị xóa khỏi cấu hình cửa hàng.` : 'Mục này sẽ bị xóa.'}
        actionLabel="Xóa mục"
        isActionLoading={isDeleting}
        onAction={confirmDelete}
      />
    </VStack>
  );
};

export default AdminStorefrontView;
