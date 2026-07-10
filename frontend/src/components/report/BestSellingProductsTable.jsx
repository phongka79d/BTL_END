import React, { useMemo } from 'react';
import { Text, VStack, proportional } from '@astryxdesign/core';
import AdminTable from '../admin/AdminTable';
import { formatPrice } from '../product/productUtils';

export const BestSellingProductsTable = ({
  isLoading = false,
  products = [],
}) => {
  const rows = useMemo(
    () => products.map((product) => ({
      ...product,
      id: product.productId,
    })),
    [products]
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Sản phẩm',
        width: proportional(2),
        renderCell: (product) => (
          <Text weight="semibold">{product.name}</Text>
        ),
      },
      {
        key: 'brand',
        header: 'Thương hiệu',
        width: proportional(1),
        renderCell: (product) => (
          <Text color="secondary">{product.brand || '—'}</Text>
        ),
      },
      {
        key: 'soldQuantity',
        header: 'Số lượng đã bán',
        width: proportional(1),
        align: 'end',
        renderCell: (product) => (
          <Text hasTabularNumbers>{product.soldQuantity}</Text>
        ),
      },
      {
        key: 'revenue',
        header: 'Doanh thu',
        width: proportional(1),
        align: 'end',
        renderCell: (product) => (
          <Text weight="semibold" hasTabularNumbers>
            {formatPrice(product.revenue)}
          </Text>
        ),
      },
    ],
    []
  );

  return (
    <VStack gap={3}>
      <VStack gap={1}>
        <Text weight="semibold">Best-selling products</Text>
        <Text color="secondary">
          Các sản phẩm hàng đầu từ những đơn hàng hoàn tất đã thanh toán COD.
        </Text>
      </VStack>
      <AdminTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        emptyTitle="No sales data yet"
        emptyDescription="Completed paid COD orders will appear here."
      />
    </VStack>
  );
};

export default BestSellingProductsTable;
