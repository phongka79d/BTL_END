import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertDialog,
  Button,
  Heading,
  Text,
  Toolbar,
  VStack
} from '@astryxdesign/core';
import { categoryApi } from '../../api/categoryApi';
import CategoryForm from '../../components/admin/CategoryForm';
import CategoryTable from '../../components/admin/CategoryTable';
import Alert from '../../components/common/Alert';

export const AdminCategoryView = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await categoryApi.getCategories();
      setCategories(response?.data?.categories || []);
    } catch (error) {
      setCategories([]);
      setLoadError(error?.message || 'Unable to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateForm = () => {
    setEditingCategory(null);
    setFeedback(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleSave = async (payload) => {
    if (editingCategory) {
      await categoryApi.updateCategory(editingCategory.id, payload);
      setFeedback({
        title: 'Category updated',
        description: `${payload.name} was updated successfully.`,
        status: 'success'
      });
    } else {
      await categoryApi.createCategory(payload);
      setFeedback({
        title: 'Category created',
        description: `${payload.name} was added successfully.`,
        status: 'success'
      });
    }

    await loadCategories();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);
    try {
      await categoryApi.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({
        title: 'Category deleted',
        description: `${deleteTarget.name} was deleted successfully.`,
        status: 'success'
      });
      await loadCategories();
    } catch (error) {
      setFeedback({
        title: 'Unable to delete category',
        description: error?.message || 'The category could not be deleted.',
        status: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <VStack gap={6} width="100%">
      <VStack gap={1}>
        <Heading level={1}>Categories</Heading>
        <Text color="secondary">
          Create, update, and remove catalog categories.
        </Text>
      </VStack>

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
          status={feedback.status}
        />
      )}

      <Toolbar
        label="Category management"
        endContent={(
          <Button
            label="Create category"
            variant="primary"
            onClick={openCreateForm}
          />
        )}
      />

      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        error={loadError}
        isDeleting={isDeleting}
        onCreate={openCreateForm}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
        onRetry={loadCategories}
      />

      <CategoryForm
        category={editingCategory}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSave}
      />

      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) {
            setDeleteTarget(null);
          }
        }}
        title="Delete category?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be permanently removed if it has no products.`
            : 'This category will be permanently removed if it has no products.'
        }
        actionLabel="Delete category"
        isActionLoading={isDeleting}
        onAction={handleDelete}
      />
    </VStack>
  );
};

export default AdminCategoryView;
