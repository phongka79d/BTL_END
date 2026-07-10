import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  Badge,
  Button,
  Heading,
  HStack,
  Text,
  Toolbar,
  VStack,
  proportional,
  pixel
} from '@astryxdesign/core';
import { reviewApi } from '../../api/reviewApi';
import AdminTable from '../../components/admin/AdminTable';
import ProductPicker from '../../components/admin/ProductPicker';
import Alert from '../../components/common/Alert';
import { formatDate } from '../../components/common/formatDate';

const getCustomerName = (review) => (
  review?.user?.username ||
  review?.user?.fullName ||
  review?.user?.email ||
  'Khách hàng'
);

const getProductName = (review) => (
  review?.product?.name ||
  review?.product?.title ||
  'Sản phẩm'
);

export const AdminReviewView = () => {
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hideTarget, setHideTarget] = useState(null);
  const [isHiding, setIsHiding] = useState(false);

  const loadReviews = useCallback(async (productId = '') => {
    setIsReviewsLoading(true);
    setLoadError('');

    try {
      const response = await reviewApi.getAdminReviews(productId ? { productId } : {});
      setReviews(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setReviews([]);
      setLoadError(error?.message || 'Không thể tải đánh giá.');
    } finally {
      setIsReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleProductChange = (productId) => {
    setSelectedProductId(productId);
    setFeedback(null);
    loadReviews(productId);
  };

  const handleHideReview = () => {
    if (!hideTarget) {
      return;
    }

    const target = hideTarget;

    setIsHiding(true);
    setFeedback(null);
    setHideTarget(null);
    setReviews((currentReviews) => currentReviews.filter((review) => review.id !== target.id));
    setFeedback({
      title: 'Đã ẩn đánh giá',
      description: 'Đánh giá đã được xóa khỏi trang chi tiết sản phẩm công khai.',
      status: 'success'
    });

    reviewApi.hideReview(target.id)
      .catch((error) => {
        setFeedback({
          title: 'Không thể ẩn đánh giá',
          description: error?.message || 'Không thể ẩn đánh giá.',
          status: 'error'
        });
        loadReviews(selectedProductId);
      })
      .finally(() => {
        setIsHiding(false);
      });
  };

  const columns = useMemo(
    () => [
      {
        key: 'customer',
        header: 'Khách hàng',
        width: proportional(1.4),
        renderCell: (review) => (
          <VStack gap={0}>
            <Text weight="semibold">{getCustomerName(review)}</Text>
            <Text size="supporting" color="secondary">
              {review.user?.email || 'Chưa có email'}
            </Text>
          </VStack>
        )
      },
      {
        key: 'rating',
        header: 'Xếp hạng',
        width: pixel(120),
        renderCell: (review) => (
          <Badge variant="yellow" label={`${Number(review.rating) || 0}/5`} />
        )
      },
      {
        key: 'product',
        header: 'Sản phẩm',
        width: proportional(1.2),
        renderCell: (review) => (
          <VStack gap={0}>
            <Text weight="semibold">{getProductName(review)}</Text>
            <Text size="supporting" color="secondary">
              {review.product?.brand || 'Chưa có thương hiệu'}
            </Text>
          </VStack>
        )
      },
      {
        key: 'comment',
        header: 'Nhận xét',
        width: proportional(2),
        renderCell: (review) => (
          <Text color={review.comment ? undefined : 'secondary'}>
            {review.comment || 'Chưa có nhận xét.'}
          </Text>
        )
      },
      {
        key: 'createdAt',
        header: 'Ngày',
        width: proportional(1),
        renderCell: (review) => (
          <Text size="supporting" color="secondary">
            {formatDate(review.createdAt)}
          </Text>
        )
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: pixel(260),
        align: 'end',
        renderCell: (review) => {
          const productId = review.productId || review.product?.id || selectedProductId;

          return (
            <HStack gap={2} style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                label="Xem sản phẩm"
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/products/${productId}`)}
                isDisabled={!productId}
              />
              <Button
                label="Ẩn đánh giá"
                variant="secondary"
                size="sm"
                onClick={() => setHideTarget(review)}
              />
            </HStack>
          );
        }
      }
    ],
    [navigate, selectedProductId]
  );

  const isLoading = isReviewsLoading;

  return (
    <VStack gap={6} width="100%">
      <VStack gap={1}>
        <Heading level={1}>Quản lý đánh giá</Heading>
        <Text color="secondary">
          Ẩn các đánh giá sản phẩm đang hiển thị khỏi trang chi tiết sản phẩm công khai.
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
        label="Đánh giá sản phẩm"
        startContent={(
          <ProductPicker
            value={selectedProductId || undefined}
            onChange={handleProductChange}
          />
        )}
        endContent={(
          <HStack gap={2}>
            <Button
              label="Làm mới đánh giá"
              variant="secondary"
              onClick={() => loadReviews(selectedProductId)}
              isDisabled={isLoading}
            />
          </HStack>
        )}
      />

      <Text size="supporting" color="secondary">
        {selectedProductId
          ? 'Đang hiển thị các đánh giá của sản phẩm đã chọn.'
          : 'Đang hiển thị tất cả đánh giá hiện có. Tìm kiếm và chọn sản phẩm để lọc.'}
      </Text>

      <AdminTable
        key={reviews.map((review) => review.id).join(':')}
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        error={loadError}
        errorTitle="Không thể tải đánh giá"
        emptyTitle="Không có đánh giá hiển thị"
        emptyDescription={
          selectedProductId
            ? 'Đánh giá của sản phẩm đã chọn sẽ xuất hiện tại đây.'
            : 'Đánh giá sản phẩm đang hiển thị sẽ xuất hiện tại đây.'
        }
        onRetry={() => loadReviews(selectedProductId)}
      />

      <AlertDialog
        isOpen={Boolean(hideTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isHiding) {
            setHideTarget(null);
          }
        }}
        title="Ẩn đánh giá?"
        description={
          hideTarget
            ? `Đánh giá của ${getCustomerName(hideTarget)} sẽ bị xóa khỏi trang chi tiết sản phẩm công khai.`
            : 'Đánh giá này sẽ bị xóa khỏi trang chi tiết sản phẩm công khai.'
        }
        actionLabel="Ẩn đánh giá"
        isActionLoading={isHiding}
        onAction={handleHideReview}
      />
    </VStack>
  );
};

export default AdminReviewView;
