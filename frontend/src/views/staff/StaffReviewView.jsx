import React, { useState, useEffect, useCallback } from 'react';
import { Button, HStack, Text } from '@astryxdesign/core';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { formatDate } from '../../components/common/formatDate';
import { reviewApi } from '../../api/reviewApi';
import { useNotification } from '../../contexts/NotificationContext';
import { RefreshIcon } from '../../components/common/LayoutIcons';

export const StaffReviewView = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getAdminReviews();
      if (res.success && res.data) {
        let items = res.data.reviews || res.data.items || res.data || [];
        if (!Array.isArray(items) && res.data.reviews) {
          items = res.data.reviews;
        }

        if (Array.isArray(items)) {
          if (search) {
            const term = search.toLowerCase();
            items = items.filter(
              (r) =>
                (r.comment && r.comment.toLowerCase().includes(term)) ||
                (r.product?.name && r.product.name.toLowerCase().includes(term)) ||
                (r.user?.fullName && r.user.fullName.toLowerCase().includes(term)) ||
                (r.user?.username && r.user.username.toLowerCase().includes(term))
            );
          }
          setReviews(items);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      notifyError('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [search, notifyError]);

  useEffect(() => {
    fetchReviews();
  }, [search]);

  const handleOpenConfirm = (review) => {
    setSelectedReview(review);
    setIsConfirmOpen(true);
  };

  const handleHideReview = async () => {
    if (!selectedReview) return;
    setActionLoading(true);
    try {
      const res = await reviewApi.hideReview(selectedReview.id);
      if (res.success) {
        notifySuccess('Đã ẩn đánh giá của khách hàng thành công');
        setIsConfirmOpen(false);
        fetchReviews();
      } else {
        notifyError(res.message || 'Ẩn đánh giá thất bại');
      }
    } catch (err) {
      notifyError(err.message || 'Đã xảy ra lỗi khi ẩn đánh giá');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'product',
      title: 'Sản phẩm',
      render: (product) => (
        <span style={{ fontWeight: 600 }}>{product?.name || 'Sản phẩm'}</span>
      )
    },
    {
      key: 'user',
      title: 'Khách hàng',
      render: (user) => user?.fullName || user?.username || 'Khách hàng'
    },
    {
      key: 'rating',
      title: 'Đánh giá',
      width: '120px',
      render: (rating) => (
        <HStack gap={1} align="center">
          <span style={{ color: '#f59e0b', fontSize: '1rem' }}>{'★'.repeat(rating || 0)}</span>
          <span style={{ color: '#d1d5db', fontSize: '1rem' }}>{'★'.repeat(Math.max(0, 5 - (rating || 0)))}</span>
        </HStack>
      )
    },
    {
      key: 'comment',
      title: 'Nội dung nhận xét',
      render: (comment) => (
        <div style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {comment || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Không có nhận xét</span>}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (status) => <StatusBadge status={status} type="review" />
    },
    {
      key: 'createdAt',
      title: 'Ngày gửi',
      render: (date) => formatDate(date)
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'right',
      render: (_, row) => (
        row.status === 'visible' ? (
          <Button
            label="Ẩn đánh giá"
            variant="destructive"
            size="sm"
            onClick={() => handleOpenConfirm(row)}
          />
        ) : (
          <Text size="sm" color="secondary">
            Đã ẩn
          </Text>
        )
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Kiểm duyệt đánh giá"
        subtitle="Quản lý và ẩn các đánh giá không phù hợp hoặc vi phạm chính sách của cửa hàng."
        actions={
          <Button
            label="Làm mới"
            variant="secondary"
            size="sm"
            onClick={fetchReviews}
            icon={<RefreshIcon size={14} />}
          />
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên sản phẩm, khách hàng, nội dung..."
        hasActiveFilters={!!search}
        onReset={() => setSearch('')}
      />

      <DataTable columns={columns} data={reviews} loading={loading} />

      {/* Dialog xác nhận ẩn đánh giá */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleHideReview}
        title="Xác nhận ẩn đánh giá"
        message={
          <div>
            Bạn có chắc chắn muốn ẩn đánh giá của khách hàng{' '}
            <strong>{selectedReview?.user?.fullName || selectedReview?.user?.username}</strong> khỏi trang sản phẩm không?
          </div>
        }
        confirmLabel="Ẩn đánh giá"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default StaffReviewView;
