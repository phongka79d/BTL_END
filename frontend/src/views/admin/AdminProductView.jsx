import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1
};

export const AdminProductView = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
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

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await productApi.getProducts({
        keyword: search,
        page,
        limit: DEFAULT_PAGINATION.limit
      });
      setProducts(response?.data?.items || []);
      setPagination(response?.data?.pagination || {
        ...DEFAULT_PAGINATION,
        page
      });
    } catch (error) {
      setProducts([]);
      setPagination({ ...DEFAULT_PAGINATION, page });
        setLoadError(error?.message || 'Không thể tải sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

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
        emptyTitle={search ? 'Không có sản phẩm phù hợp' : 'Chưa có sản phẩm'}
        emptyDescription={
          search
            ? 'Hãy xóa tìm kiếm hoặc thử tên sản phẩm hay thương hiệu khác.'
            : 'Hãy tạo sản phẩm đầu tiên để bổ sung vào danh mục.'
        }
        emptyActionLabel={search ? 'Xóa tìm kiếm' : 'Tạo sản phẩm'}
        emptyActionDisabled={!search && categories.length === 0}
        onEmptyAction={search ? clearSearch : openCreateForm}
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
