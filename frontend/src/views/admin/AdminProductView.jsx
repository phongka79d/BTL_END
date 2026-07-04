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
      setLoadError(error?.message || 'Unable to load products.');
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
      setCategoryError(error?.message || 'Unable to load categories.');
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
      setFeedback({ title: 'Product updated', description: `${payload.name} was updated successfully.` });
    } else {
      await productApi.createProduct(payload);
      setFeedback({ title: 'Product created', description: `${payload.name} was added successfully.` });
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
        title: 'Product deleted',
        description: `${deleteTarget.name} was deleted successfully.`
      });

      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadProducts();
      }
    } catch (error) {
      setFeedback({
        title: 'Unable to delete product',
        description: error?.message || 'The product could not be deleted.'
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
        <Heading level={1}>Products</Heading>
        <Text color="secondary">
          Create, update, and remove catalog products.
        </Text>
      </VStack>

      {categoryError && (
        <Alert
          title="Categories unavailable"
          description={categoryError}
          actionLabel="Retry categories"
          onAction={loadCategories}
        />
      )}

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
        />
      )}

      <Toolbar
        label="Product management"
        startContent={(
          <TextInput
            label="Search products"
            isLabelHidden
            value={draftSearch}
            onChange={setDraftSearch}
            onEnter={submitSearch}
            placeholder="Search name or brand"
            hasClear
            width="100%"
          />
        )}
        endContent={(
          <HStack gap={2}>
            <Button
              label="Search"
              variant="secondary"
              onClick={submitSearch}
              isDisabled={isLoading}
            />
            {search && (
              <Button
                label="Clear search"
                variant="ghost"
                onClick={clearSearch}
                isDisabled={isLoading}
              />
            )}
            <Button
              label="Create product"
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
        emptyTitle={search ? 'No matching products' : 'No products yet'}
        emptyDescription={
          search
            ? 'Clear the search or try another product name or brand.'
            : 'Create the first product to populate the catalog.'
        }
        emptyActionLabel={search ? 'Clear search' : 'Create product'}
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
        title="Delete product?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be permanently removed from the catalog.`
            : 'This product will be permanently removed from the catalog.'
        }
        actionLabel="Delete product"
        isActionLoading={isDeleting}
        onAction={handleDelete}
      />
    </VStack>
  );
};

export default AdminProductView;
