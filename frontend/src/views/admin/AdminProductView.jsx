import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertDialog,
  Button,
  Heading,
  HStack,
  Text,
  TextInput,
  Toolbar,
  VStack
} from '@astryxdesign/core';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import ProductForm from '../../components/admin/ProductForm';
import ProductTable from '../../components/admin/ProductTable';
import Alert from '../../components/common/Alert';
import Pagination from '../../components/common/Pagination';
import {
  getProductListEmptyCopy,
  normalizeCategoryId,
  removeCategoryFilter,
  resolveCategoryLabel
} from './adminProductListUtils';

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1
};

export const AdminProductView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = normalizeCategoryId(searchParams.get('categoryId'));
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [pageCategoryId, setPageCategoryId] = useState(categoryId);
  const [draftSearch, setDraftSearch] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const latestRequestRef = useRef(0);

  // Đổi danh mục (kể cả back/forward khi view còn mounted) phải quay về trang 1
  // ngay trong render để lần tải đầu của danh mục mới không dùng trang cũ.
  if (pageCategoryId !== categoryId) {
    setPageCategoryId(categoryId);
    setPage(1);
  }

  const loadProducts = useCallback(async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await productApi.getProducts({
        keyword: search,
        categoryId,
        page,
        limit: DEFAULT_PAGINATION.limit
      });
      if (requestId !== latestRequestRef.current) {
        return;
      }
      setProducts(response?.data?.items || []);
      setPagination(response?.data?.pagination || {
        ...DEFAULT_PAGINATION,
        page
      });
    } catch (error) {
      if (requestId !== latestRequestRef.current) {
        return;
      }
      setProducts([]);
      setPagination({ ...DEFAULT_PAGINATION, page });
      setLoadError(error?.message || 'Không thể tải sản phẩm.');
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, [categoryId, page, search]);

  const loadCategories = useCallback(async () => {
    setCategoryError('');

    try {
      const response = await categoryApi.getCategories();
      setCategories(response?.data?.categories || []);
    } catch (error) {
      setCategories([]);
      setCategoryError(error?.message || 'Không thể tải danh mục.');
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setFeedback(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleSave = async (payload) => {
    if (editingProduct) {
      await productApi.updateProduct(editingProduct.id, payload);
      setFeedback({ title: 'Đã cập nhật sản phẩm', description: `${payload.name} đã được cập nhật thành công.`, status: 'success' });
    } else {
      await productApi.createProduct(payload);
      setFeedback({ title: 'Đã tạo sản phẩm', description: `${payload.name} đã được thêm thành công.`, status: 'success' });
    }

    await loadProducts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);
    try {
      await productApi.deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({
        title: 'Đã xóa sản phẩm',
        description: `${deleteTarget.name} đã được xóa thành công.`,
        status: 'success'
      });

      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadProducts();
      }
    } catch (error) {
      setFeedback({
        title: 'Không thể xóa sản phẩm',
        description: error?.message || 'Không thể xóa sản phẩm.',
        status: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const submitSearch = () => {
    setPage(1);
    setSearch(draftSearch.trim());
  };

  const clearSearch = () => {
    setDraftSearch('');
    setPage(1);
    setSearch('');
  };

  const clearCategoryFilter = () => {
    setSearchParams((currentParams) => removeCategoryFilter(currentParams));
  };

  const categoryLabel = resolveCategoryLabel(categories, categoryId);
  const emptyCopy = getProductListEmptyCopy({
    categoryId,
    categoryLabel,
    keyword: search
  });
  const emptyActions = {
    clearCategory: { onClick: clearCategoryFilter, isDisabled: false },
    clearSearch: { onClick: clearSearch, isDisabled: false },
    create: { onClick: openCreateForm, isDisabled: categories.length === 0 }
  };
  const emptyAction = emptyActions[emptyCopy.action] || emptyActions.create;

  return (
    <VStack gap={6} width="100%">
      <VStack gap={1}>
        <Heading level={1}>Sản phẩm</Heading>
        <Text color="secondary">
          Tạo, cập nhật và xóa sản phẩm trong danh mục.
        </Text>
      </VStack>

      {categoryError && (
        <Alert
          title="Danh mục không khả dụng"
          description={categoryError}
          actionLabel="Thử lại danh mục"
          onAction={loadCategories}
        />
      )}

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
          status={feedback.status}
        />
      )}

      {categoryId && (
        <HStack gap={2} align="center" wrap="wrap">
          <Text type="supporting">Đang lọc theo danh mục:</Text>
          <Text weight="semibold">{categoryLabel}</Text>
          <Button
            label="Xóa bộ lọc danh mục"
            variant="ghost"
            size="sm"
            onClick={clearCategoryFilter}
            isDisabled={isLoading}
          />
        </HStack>
      )}

      <Toolbar
        label="Quản lý sản phẩm"
        startContent={(
          <TextInput
            label="Tìm kiếm sản phẩm"
            isLabelHidden
            value={draftSearch}
            onChange={setDraftSearch}
            onEnter={submitSearch}
            placeholder="Tìm theo tên hoặc thương hiệu"
            hasClear
            width="100%"
          />
        )}
        endContent={(
          <HStack gap={2}>
            <Button
              label="Tìm kiếm"
              variant="secondary"
              onClick={submitSearch}
              isDisabled={isLoading}
            />
            {search && (
              <Button
                label="Xóa tìm kiếm"
                variant="ghost"
                onClick={clearSearch}
                isDisabled={isLoading}
              />
            )}
            <Button
              label="Tạo sản phẩm"
              variant="primary"
              onClick={openCreateForm}
              isDisabled={categories.length === 0}
            />
          </HStack>
        )}
      />

      <ProductTable
        products={products}
        isLoading={isLoading}
        error={loadError}
        isDeleting={isDeleting}
        onView={(product) => navigate(`/products/${product.id}`)}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
        onRetry={loadProducts}
        emptyTitle={emptyCopy.title}
        emptyDescription={emptyCopy.description}
        emptyActionLabel={emptyCopy.actionLabel}
        emptyActionDisabled={emptyAction.isDisabled}
        onEmptyAction={emptyAction.onClick}
      />

      {!isLoading && !loadError && products.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <ProductForm
        categories={categories}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSave}
        product={editingProduct}
      />

      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) {
            setDeleteTarget(null);
          }
        }}
        title="Xóa sản phẩm?"
        description={
          deleteTarget
            ? `${deleteTarget.name} sẽ bị xóa vĩnh viễn khỏi danh mục.`
            : 'Sản phẩm này sẽ bị xóa vĩnh viễn khỏi danh mục.'
        }
        actionLabel="Xóa sản phẩm"
        isActionLoading={isDeleting}
        onAction={handleDelete}
      />
    </VStack>
  );
};

export default AdminProductView;
