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
      setLoadError(error?.message || 'Không thể tải danh mục.');
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
        title: 'Đã cập nhật danh mục',
        description: `${payload.name} đã được cập nhật thành công.`,
        status: 'success'
      });
    } else {
      await categoryApi.createCategory(payload);
      setFeedback({
        title: 'Đã tạo danh mục',
        description: `${payload.name} đã được thêm thành công.`,
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
        title: 'Đã xóa danh mục',
        description: `${deleteTarget.name} đã được xóa thành công.`,
        status: 'success'
      });
      await loadCategories();
    } catch (error) {
      setFeedback({
        title: 'Không thể xóa danh mục',
        description: error?.message || 'Không thể xóa danh mục.',
        status: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <VStack gap={6} width="100%">
      <VStack gap={1}>
        <Heading level={1}>Danh mục</Heading>
        <Text color="secondary">
          Tạo, cập nhật và xóa danh mục sản phẩm.
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
        label="Quản lý danh mục"
        endContent={(
          <Button
            label="Tạo danh mục"
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
        title="Xóa danh mục?"
        description={
          deleteTarget
            ? `${deleteTarget.name} sẽ bị xóa vĩnh viễn nếu không có sản phẩm.`
            : 'Danh mục này sẽ bị xóa vĩnh viễn nếu không có sản phẩm.'
        }
        actionLabel="Xóa danh mục"
        isActionLoading={isDeleting}
        onAction={handleDelete}
      />
    </VStack>
  );
};

export default AdminCategoryView;
