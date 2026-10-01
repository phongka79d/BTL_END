import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  EmptyState,
  Heading,
  HStack,
  MoreMenu,
  Selector,
  Text,
  TextInput,
  Toolbar,
  VStack,
  proportional,
  pixel,
} from '@astryxdesign/core';
import { orderApi } from '../../api/orderApi';
import { formatPrice } from '../../components/product/productUtils';
import { formatDate } from '../../components/common/formatDate';
import {
  ORDER_STATUS_VALUES,
  ORDER_STATUS_LABELS,
} from '../../constants/orderConstants';
import AdminTable from '../../components/admin/AdminTable';
import Alert from '../../components/common/Alert';
import AdminOrderDetailDialog from '../../components/admin/AdminOrderDetailDialog';
import OrderStatusSelect from '../../components/admin/OrderStatusSelect';
import PaymentStatusBadge from '../../components/order/PaymentStatusBadge';
import Pagination from '../../components/common/Pagination';
import {
  ADMIN_ORDERS_PAGE_SIZE,
  buildAdminOrdersQuery,
  getAdminOrdersEmptyCopy,
  summarizeAdminOrders,
} from './adminOrderListUtils';

const STATUS_FILTER_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  ...ORDER_STATUS_VALUES.map((value) => ({
    label: ORDER_STATUS_LABELS[value] || value,
    value,
  })),
];

const buildOrderId = (id) => {
  if (!id) return '—';
  return `#${id.slice(0, 8)}\u2026`;
};

/**
 * AdminOrderView
 *
 * Hiển thị tất cả đơn hàng cho người dùng admin trong bảng cùng thông tin khách hàng,
 * badge trạng thái, tổng tiền, ngày tháng và các điều khiển thao tác.
 *
 * Các cột (theo §17.1 AdminOrderTable + bàn giao (05A)):
 *   Customer    – tên người dùng + email (VStack)
 *   Order ID    – hash rút gọn
 *   Date        – createdAt đã định dạng
 *   Total       – totalAmount đã định dạng
 *   Order Status– OrderStatusSelect (Selector nội tuyến, đã kết nối ở (05D))
 *   Payment     – PaymentStatusBadge
 *   Thao tác     – MoreMenu (Xem chi tiết, Cập nhật trạng thái)
 *
 * Tìm kiếm dùng bản nháp (draft): chỉ gửi truy vấn khi người dùng nhấn Enter
 * hoặc nút "Tìm kiếm", nên không có truy vấn theo từng ký tự. Từ khóa được gửi
 * kèm `searchField: 'all'` để tìm theo mã đơn, khách hàng, email, SĐT và địa chỉ.
 * Tìm kiếm kết hợp được với lọc trạng thái; đổi từ khóa/trạng thái luôn đưa về
 * trang 1, còn đổi trang giữ nguyên từ khóa hiện tại.
 *
 * Các trạng thái xử lý: loading, success, empty (không có đơn hàng / không khớp
 * bộ lọc), error và bị từ chối quyền. Toolbar tìm kiếm + lọc luôn hiển thị ở mọi
 * trạng thái dữ liệu để người dùng thoát khỏi màn hình rỗng hoặc lỗi.
 * Sử dụng phân trang và lọc trạng thái phía máy chủ thông qua orderApi.
 */
export const AdminOrderView = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [draftKeyword, setDraftKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [detailDialogOrderId, setDetailDialogOrderId] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const requestIdRef = useRef(0);

  const fetchOrders = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);
    setIsPermissionDenied(false);

    try {
      const response = await orderApi.getAdminOrders(
        buildAdminOrdersQuery({
          keyword,
          status: statusFilter,
          page,
          limit: ADMIN_ORDERS_PAGE_SIZE,
        })
      );

      // Bỏ qua phản hồi cũ để kết quả tìm kiếm/lọc mới nhất luôn thắng.
      if (requestId !== requestIdRef.current) return;

      const data = response?.data;

      if (data && data.items) {
        setOrders(data.items);
        const pagination = data.pagination;
        setTotalPages(pagination?.totalPages || 1);
        setTotalCount(pagination?.total ?? data.items.length);
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalPages(Math.max(1, Math.ceil(data.length / ADMIN_ORDERS_PAGE_SIZE)));
        setTotalCount(data.length);
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setOrders([]);
      if (err?.status === 403) {
        setIsPermissionDenied(true);
        setError('Bạn không có quyền truy cập đơn hàng quản trị.');
      } else {
        setError(err?.message || 'Không thể tải đơn hàng. Vui lòng thử lại.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [keyword, statusFilter, page]);

  const handleStatusFilterChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  }, []);

  const submitSearch = useCallback(() => {
    setKeyword(draftKeyword.trim());
    setPage(1);
  }, [draftKeyword]);

  const clearSearch = useCallback(() => {
    setDraftKeyword('');
    setKeyword('');
    setPage(1);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewDetails = useCallback((order) => {
    setDetailDialogOrderId(order.id);
    setIsDetailDialogOpen(true);
  }, []);

  const handleStatusUpdated = useCallback(
    (updatedOrder) => {
      if (!updatedOrder?.id) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updatedOrder.id
            ? { ...o, ...updatedOrder }
            : o
        )
      );
    },
    []
  );

  const columns = useMemo(
    () => [
      {
        key: 'customer',
        header: 'Khách hàng',
        width: proportional(2),
        renderCell: (order) => (
          <VStack gap={0}>
            <Text weight="semibold">
              {order.user?.fullName || order.user?.username || '—'}
            </Text>
            <Text size="supporting" color="secondary">
              {order.user?.email || '—'}
            </Text>
          </VStack>
        ),
      },
      {
        key: 'id',
        header: 'Mã đơn hàng',
        width: proportional(1),
        renderCell: (order) => (
          <Text size="supporting" hasTabularNumbers>
            {buildOrderId(order.id)}
          </Text>
        ),
      },
      {
        key: 'createdAt',
        header: 'Ngày',
        width: proportional(1.5),
        renderCell: (order) => (
          <Text size="supporting" color="secondary">
            {formatDate(order.createdAt)}
          </Text>
        ),
      },
      {
        key: 'totalAmount',
        header: 'Tổng cộng',
        width: proportional(1),
        align: 'end',
        renderCell: (order) => (
          <Text weight="semibold" hasTabularNumbers>
            {formatPrice(order.totalAmount)}
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái đơn hàng',
        width: proportional(2),
        renderCell: (order) => (
          <OrderStatusSelect
            order={order}
            onStatusUpdated={handleStatusUpdated}
          />
        ),
      },
      {
        key: 'paymentStatus',
        header: 'Thanh toán',
        width: proportional(1),
        renderCell: (order) => {
          const paymentStatus = order.payment?.paymentStatus || 'unpaid';
          return <PaymentStatusBadge status={paymentStatus} />;
        },
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: pixel(72),
        align: 'end',
        resizable: false,
        renderCell: (order) => (
          <MoreMenu
            label={`Actions for order ${buildOrderId(order.id)}`}
            items={[
              {
                label: 'Xem chi tiết',
                onClick: () => handleViewDetails(order),
              },
            ]}
          />
        ),
      },
    ],
    [handleViewDetails, handleStatusUpdated]
  );

  const hasActiveFilters = Boolean(keyword || statusFilter);
  const activeStatusLabel = ORDER_STATUS_LABELS[statusFilter] || statusFilter;
  const emptyCopy = getAdminOrdersEmptyCopy({
    keyword,
    status: statusFilter,
    statusLabel: activeStatusLabel,
  });
  const isInitialLoad = isLoading && orders.length === 0;
  const summaryText =
    error || (isInitialLoad && !hasActiveFilters)
      ? 'Xem và quản lý tất cả đơn hàng của khách hàng.'
      : summarizeAdminOrders({
          count: totalCount || orders.length,
          keyword,
          status: statusFilter,
          statusLabel: activeStatusLabel,
        });

  const toolbar = (
    <Toolbar
      label="Bộ lọc đơn hàng"
      startContent={(
        <HStack
          align="center"
          gap={3}
          justify="between"
          wrap="wrap"
          style={{ flex: 1, minWidth: 0 }}
        >
          <HStack align="center" gap={3} wrap="wrap" style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div style={{ flex: '1 1 240px', minWidth: '200px', maxWidth: '420px' }}>
              <TextInput
                label="Tìm kiếm đơn hàng"
                isLabelHidden
                value={draftKeyword}
                onChange={setDraftKeyword}
                onEnter={submitSearch}
                placeholder="Tìm mã đơn, khách hàng, email, SĐT hoặc địa chỉ"
                hasClear
                width="100%"
              />
            </div>

            <Selector
              label="Lọc theo trạng thái"
              isLabelHidden
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={STATUS_FILTER_OPTIONS}
              placeholder="Tất cả trạng thái"
              width="220px"
            />
          </HStack>

          <HStack align="center" gap={2} wrap="wrap">
            <Button
              label="Tìm kiếm"
              variant="secondary"
              onClick={submitSearch}
              isDisabled={isLoading}
            />
            {keyword && (
              <Button
                label="Xóa tìm kiếm"
                variant="ghost"
                onClick={clearSearch}
                isDisabled={isLoading}
              />
            )}
            {statusFilter && (
              <Button
                label="Xóa bộ lọc"
                variant="ghost"
                onClick={() => handleStatusFilterChange('')}
                isDisabled={isLoading}
              />
            )}
          </HStack>
        </HStack>
      )}
    />
  );

  /* ---------- Bị từ chối quyền ---------- */
  if (isPermissionDenied) {
    return (
      <VStack
        style={{
          width: '100%',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Heading level={1}>Quản lý đơn hàng</Heading>
          <Text color="secondary">
            Xem và quản lý tất cả đơn hàng của khách hàng.
          </Text>
        </VStack>

        <EmptyState
          title="Truy cập bị từ chối"
          description={error}
          isCompact
        />
      </VStack>
    );
  }

  return (
    <VStack
      style={{
        width: '100%',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-6)',
      }}
    >
      <VStack gap={1}>
        <Heading level={1}>Quản lý đơn hàng</Heading>
        <Text color="secondary">{summaryText}</Text>
      </VStack>

      {toolbar}

      {error ? (
        <Alert
          title="Không thể tải đơn hàng"
          description={error}
          actionLabel="Thử lại"
          onAction={fetchOrders}
        />
      ) : (
        <AdminTable
          columns={columns}
          data={orders}
          emptyTitle={emptyCopy.title}
          emptyDescription={emptyCopy.description}
          isLoading={isLoading}
          error={null}
        />
      )}

      {!error && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <AdminOrderDetailDialog
        isOpen={isDetailDialogOpen}
        orderId={detailDialogOrderId}
        onOpenChange={setIsDetailDialogOpen}
      />
    </VStack>
  );
};

export default AdminOrderView;
