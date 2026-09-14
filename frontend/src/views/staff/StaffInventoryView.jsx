import React, { useState, useEffect, useCallback } from 'react';
import { Button, Dialog, Heading, HStack, VStack, Text, TextInput, Selector, Badge } from '@astryxdesign/core';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import { productApi } from '../../api/productApi';
import { formatPrice, getProductImageSrc } from '../../components/product/productUtils';
import { useNotification } from '../../contexts/NotificationContext';
import { RefreshIcon } from '../../components/common/LayoutIcons';

export const StaffInventoryView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({
        page,
        limit: 12,
        keyword: search || undefined
      });
      if (res.success && res.data) {
        let items = res.data.products || res.data.items || [];
        if (stockFilter === 'low') {
          items = items.filter((p) => (p.quantity || 0) <= 5);
        } else if (stockFilter === 'out') {
          items = items.filter((p) => (p.quantity || 0) === 0);
        }
        setProducts(items);
        const pag = res.data.pagination || { page: 1, totalPages: 1, total: items.length };
        setPagination({
          page: pag.page || 1,
          totalPages: pag.totalPages || 1,
          total: pag.total || items.length
        });
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      notifyError('Không thể tải danh sách tồn kho');
    } finally {
      setLoading(false);
    }
  }, [search, stockFilter, notifyError]);

  useEffect(() => {
    fetchProducts(1);
  }, [search, stockFilter]);

  const handleOpenStockDialog = (product) => {
    setSelectedProduct(product);
    setNewQuantity(String(product.quantity || 0));
    setIsDialogOpen(true);
  };

  const handleSaveStock = async () => {
    if (!selectedProduct) return;
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      notifyError('Số lượng tồn kho phải là số nguyên không âm');
      return;
    }

    setSaving(true);
    try {
      const res = await productApi.updateStock(selectedProduct.id, qty);
      if (res.success) {
        notifySuccess(`Đã cập nhật tồn kho sản phẩm "${selectedProduct.name}" thành ${qty}`);
        setIsDialogOpen(false);
        fetchProducts(pagination.page);
      } else {
        notifyError(res.message || 'Cập nhật tồn kho thất bại');
      }
    } catch (err) {
      notifyError(err.message || 'Đã xảy ra lỗi khi cập nhật');
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
        let variant = 'success';
        if (qty === 0) variant = 'danger';
        else if (qty <= 5) variant = 'warning';

        return (
          <Badge variant={variant} size="sm">
            {qty === 0 ? 'Hết hàng (0)' : `${qty} sản phẩm`}
          </Badge>
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
            value={newQuantity}
            onChange={(val) => setNewQuantity(val)}
            placeholder="Nhập số lượng tồn kho mới"
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
              isDisabled={saving}
            />
          </HStack>
        </VStack>
      </Dialog>
    </div>
  );
};

export default StaffInventoryView;
