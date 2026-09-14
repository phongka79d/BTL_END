import React, { useCallback, useEffect, useState } from 'react';
import { Button, Heading, HStack, Text, VStack } from '@astryxdesign/core';
import { reportApi } from '../../api/reportApi';
import Alert from '../../components/common/Alert';
import BestSellingProductsTable from '../../components/report/BestSellingProductsTable';
import OrderSummaryCards from '../../components/report/OrderSummaryCards';
import RevenueSummaryCard from '../../components/report/RevenueSummaryCard';
import { downloadCsv } from '../../utils/csvExport';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
} from '../../constants/orderConstants';

const EMPTY_REVENUE = {
  totalRevenue: 0,
  completedOrderCount: 0,
};

const INVALID_RANGE_MESSAGE = 'Ngày bắt đầu không được sau ngày kết thúc';

const buildRangeFileSuffix = (range) => {
  if (!range?.startDate && !range?.endDate) return 'toan-thoi-gian';
  return `${range?.startDate || 'dau-ky'}_${range?.endDate || 'cuoi-ky'}`;
};

export const ReportView = () => {
  const [revenue, setRevenue] = useState(EMPTY_REVENUE);
  const [products, setProducts] = useState([]);
  const [orderSummary, setOrderSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rangeError, setRangeError] = useState('');
  const [appliedRange, setAppliedRange] = useState(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [revenueResponse, productsResponse, orderSummaryResponse] =
        await Promise.all([
          reportApi.getRevenueReport(appliedRange),
          reportApi.getBestSellingProductsReport(appliedRange),
          reportApi.getOrderSummaryReport(appliedRange),
        ]);

      setRevenue(revenueResponse?.data || EMPTY_REVENUE);
      setProducts(
        Array.isArray(productsResponse?.data) ? productsResponse.data : []
      );
      setOrderSummary(orderSummaryResponse?.data || {});
    } catch (err) {
      setRevenue(EMPTY_REVENUE);
      setProducts([]);
      setOrderSummary({});
      setError(
        err?.status === 403
          ? 'Bạn không có quyền truy cập báo cáo quản trị.'
          : err?.message || 'Không thể tải báo cáo. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [appliedRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      setRangeError(INVALID_RANGE_MESSAGE);
      return;
    }

    setRangeError('');
    setAppliedRange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setRangeError('');
    setAppliedRange(null);
  };

  const handleExportRevenue = () => {
    downloadCsv(
      `bao-cao-doanh-thu-${buildRangeFileSuffix(appliedRange)}.csv`,
      ['Chỉ số', 'Giá trị'],
      [
        ['Tổng doanh thu', revenue.totalRevenue],
        ['Số đơn hoàn tất', revenue.completedOrderCount],
      ]
    );
  };

  const handleExportOrderSummary = () => {
    downloadCsv(
      `bao-cao-don-hang-${buildRangeFileSuffix(appliedRange)}.csv`,
      ['Trạng thái', 'Số lượng'],
      ORDER_STATUS_VALUES.map((status) => [
        ORDER_STATUS_LABELS[status] || status,
        Number(orderSummary[status] || 0),
      ])
    );
  };

  const hasRevenueData = Number(revenue.completedOrderCount || 0) > 0
    || Number(revenue.totalRevenue || 0) > 0;

  const dateInputStyle = {
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-2, 8px)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    font: 'inherit',
  };

  return (
    <VStack
      width="100%"
      style={{
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-6)',
      }}
    >
      <VStack gap={1}>
        <Heading level={1}>Báo cáo</Heading>
        <Text color="secondary">
          Doanh thu, sản phẩm bán chạy và tổng quan đơn hàng. Mặc định thống kê toàn bộ thời gian.
        </Text>
      </VStack>

      <VStack gap={3}>
        <HStack gap={3} align="end" style={{ flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            <Text size="sm" weight="semibold">Từ ngày</Text>
            <input
              type="date"
              value={startDate}
              aria-label="Ngày bắt đầu"
              onChange={(event) => {
                setStartDate(event.target.value);
                setRangeError('');
              }}
              style={dateInputStyle}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            <Text size="sm" weight="semibold">Đến ngày</Text>
            <input
              type="date"
              value={endDate}
              aria-label="Ngày kết thúc"
              onChange={(event) => {
                setEndDate(event.target.value);
                setRangeError('');
              }}
              style={dateInputStyle}
            />
          </label>

          <Button
            label="Lọc"
            variant="primary"
            onClick={handleApplyFilter}
            isDisabled={isLoading}
          />
          <Button
            label="Xóa lọc"
            variant="secondary"
            onClick={handleResetFilter}
            isDisabled={isLoading && !appliedRange && !startDate && !endDate}
          />
        </HStack>

        {rangeError && (
          <Alert
            title="Khoảng thời gian không hợp lệ"
            description={rangeError}
          />
        )}
      </VStack>

      {error ? (
        <Alert
          title="Không thể tải báo cáo"
          description={error}
          actionLabel="Thử lại"
          onAction={fetchReports}
        />
      ) : (
        <>
          <VStack gap={2}>
            <HStack justify="between" align="center" style={{ flexWrap: 'wrap' }}>
              <Text weight="semibold">Doanh thu</Text>
              <Button
                label="Xuất CSV"
                variant="secondary"
                size="sm"
                isDisabled={isLoading}
                onClick={handleExportRevenue}
              />
            </HStack>
            <RevenueSummaryCard
              totalRevenue={revenue.totalRevenue}
              completedOrderCount={revenue.completedOrderCount}
              isLoading={isLoading}
            />
            {!isLoading && !hasRevenueData && (
              <Text color="secondary">
                Không có dữ liệu để hiển thị trong khoảng thời gian đã chọn.
              </Text>
            )}
          </VStack>

          <VStack gap={2}>
            <HStack justify="between" align="center" style={{ flexWrap: 'wrap' }}>
              <Text weight="semibold">Thống kê đơn hàng</Text>
              <Button
                label="Xuất CSV"
                variant="secondary"
                size="sm"
                isDisabled={isLoading}
                onClick={handleExportOrderSummary}
              />
            </HStack>
            <OrderSummaryCards
              summary={orderSummary}
              isLoading={isLoading}
            />
          </VStack>

          <BestSellingProductsTable
            products={products}
            isLoading={isLoading}
          />
        </>
      )}
    </VStack>
  );
};

export default ReportView;
