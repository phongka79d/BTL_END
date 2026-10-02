import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Badge, Banner, Button, Dialog, Heading, HStack, VStack, Text, TextInput, Selector } from '@astryxdesign/core';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import { productApi } from '../../api/productApi';
import { formatPrice, getProductImageSrc, handleProductImageError } from '../../components/product/productUtils';
import { useNotification } from '../../contexts/NotificationContext';
import { RefreshIcon } from '../../components/common/LayoutIcons';
import {
  INVENTORY_LOAD_ERROR_MESSAGE,
  buildInventoryQuery,
  canSaveStockDraft,
  getStockDraftError,
  resolveInventoryPagination
} from './staffInventoryUtils';

export const StaffInventoryView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notifySuccess, notifyError } = useNotification();
  const stockDraftError = getStockDraftError(newQuantity);
  const requestIdRef = useRef(0);

  const fetchProducts = useCallback(async (page = 1) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await productApi.getProducts(
        buildInventoryQuery({ page, keyword: search, stockStatus: stockFilter })
      );

      if (requestId !== requestIdRef.current) return;

      if (res && res.success && res.data) {
        const items = res.data.products || res.data.items || [];
        setProducts(items);
        setPagination(resolveInventoryPagination(res.data.pagination, items.length));
        setLoadError(null);
      } else {
        setLoadError(res?.message || INVENTORY_LOAD_ERROR_MESSAGE);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to fetch inventory:', err);
      setLoadError(err?.message || INVENTORY_LOAD_ERROR_MESSAGE);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [search, stockFilter]);

  // Đổi từ khóa hoặc bộ lọc tồn kho thì quay về trang đầu và tải lại theo bộ lọc mới.
  useEffect(() => {
    fetchProducts(1);
  }, [search, stockFilter]);

  // Sau khi lọc/cập nhật, nếu trang hiện tại vượt quá tổng số trang thì lùi về trang cuối hợp lệ.
  useEffect(() => {
    if (pagination.page > pagination.totalPages) {
      fetchProducts(pagination.totalPages);
    }
  }, [pagination.page, pagination.totalPages, fetchProducts]);

  const handleOpenStockDialog = (product) => {
    setSelectedProduct(product);
    setNewQuantity(String(product.quantity || 0));
    setIsDialogOpen(true);
  };

  const handleSaveStock = async () => {
    if (!selectedProduct) return;

    // Chặn mọi bản nháp không hợp lệ (1.5, số âm, rỗng, ký tự lạ) trước khi gọi API.
    if (getStockDraftError(newQuantity)) return;

    const quantity = Number(newQuantity);
    setSaving(true);
    try {
      const res = await productApi.updateStock(selectedProduct.id, quantity);
      if (res && res.success) {
        notifySuccess(`Đã cập nhật tồn kho sản phẩm "${selectedProduct.name}" thành ${quantity}`);
        setIsDialogOpen(false);
        fetchProducts(pagination.page);
      } else {
        notifyError(res?.message || 'Cập nhật tồn kho thất bại');
      }
    } catch (err) {
      notifyError(err?.message || 'Đã xảy ra lỗi khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const stockFilterOptions = [
    { value: '', label: 'Tất cả mức tồn kho' },
    { value: 'low', label: 'Cảnh báo sắp hết (<= 5)' },
    { value: 'out', label: 'Hết hàng (0)' }
  ];

  const columns = [
    {
      key: 'image',
      title: 'Hình ảnh',
      width: '60px',
      render: (_, row) => (
        <img
          src={getProductImageSrc(row.imageUrl)}
          alt={row.name}
          onError={handleProductImageError}
          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
        />
      )
    },
    {
      key: 'name',
      title: 'Tên sản phẩm',
      render: (name, row) => (
        <VStack gap={1}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #6b7280)' }}>
            Hãng: {row.brand} | Danh mục: {row.category?.name || '-'}
          </span>
        </VStack>
      )
    },
    {
      key: 'price',
      title: 'Giá niêm yết',
      render: (val) => formatPrice(val)
    },
    {
      key: 'quantity',
      title: 'Tồn kho hiện tại',
      render: (qty) => {
        const quantity = Number(qty) || 0;
        let variant = 'success';
        if (quantity === 0) variant = 'error';
        else if (quantity <= 5) variant = 'warning';

        return (
          <Badge
            variant={variant}
            label={quantity === 0 ? 'Hết hàng (0)' : `${quantity} sản phẩm`}
          />
        );
      }
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'right',
      render: (_, row) => (
        <Button
          label="Điều chỉnh tồn"
          variant="secondary"
          size="sm"
          onClick={() => handleOpenStockDialog(row)}
        />
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Kiểm kê tồn kho"
        subtitle="Theo dõi số lượng hàng hóa và cập nhật số lượng nhập kho mới nhanh chóng."
        actions={
          <Button
            label="Làm mới"
            variant="secondary"
            size="sm"
            onClick={() => fetchProducts(pagination.page)}
            icon={<RefreshIcon size={14} />}
          />
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên sản phẩm, thương hiệu..."
        hasActiveFilters={!!search || !!stockFilter}
        onReset={() => {
          setSearch('');
          setStockFilter('');
        }}
        filters={
          <div style={{ width: '220px' }}>
            <Selector
              label="Lọc tồn kho"
              isLabelHidden
              value={stockFilter}
              onChange={(val) => setStockFilter(val || '')}
              options={stockFilterOptions}
            />
          </div>
        }
      />

      {loadError && (
        <Banner
          status="error"
          title="Không thể tải danh sách tồn kho"
          description={loadError}
          style={{ marginBottom: 'var(--spacing-4)' }}
          endContent={(
            <Button
              label="Thử lại"
              variant="secondary"
              size="sm"
              onClick={() => fetchProducts(pagination.page)}
              isDisabled={loading}
            />
          )}
        />
      )}

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.total,
          onPageChange: (p) => fetchProducts(p)
        }}
      />

      {/* Dialog Điều chỉnh số lượng tồn kho */}
      <Dialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => setIsDialogOpen(open)}
        purpose="form"
      >
        <VStack gap={4} style={{ minWidth: '340px', padding: 'var(--spacing-4)' }}>
          <VStack gap={1}>
            <Heading level={3} style={{ margin: 0, fontSize: '1.125rem' }}>Điều chỉnh số lượng tồn kho</Heading>
            <Text size="sm" color="secondary" style={{ margin: 0 }}>
              Sản phẩm: <strong>{selectedProduct?.name}</strong>
            </Text>
          </VStack>

          <TextInput
            label="Số lượng tồn kho mới"
            type="number"
            min="0"
            step="1"
            value={newQuantity}
            onChange={(val) => setNewQuantity(val)}
            placeholder="Nhập số lượng tồn kho mới"
            status={stockDraftError ? { type: 'error', message: stockDraftError } : undefined}
          />

          <HStack justify="end" gap={2}>
            <Button
              label="Hủy"
              variant="secondary"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              isDisabled={saving}
            />
            <Button
              label="Lưu thay đổi"
              variant="primary"
              size="sm"
              onClick={handleSaveStock}
              isLoading={saving}
              isDisabled={saving || !canSaveStockDraft(newQuantity)}
            />
          </HStack>
        </VStack>
      </Dialog>
    </div>
  );
};

export default StaffInventoryView;
