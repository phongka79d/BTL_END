import React, { useCallback, useEffect, useState } from 'react';
import { Heading, Text, VStack } from '@astryxdesign/core';
import { reportApi } from '../../api/reportApi';
import Alert from '../../components/common/Alert';
import BestSellingProductsTable from '../../components/report/BestSellingProductsTable';
import OrderSummaryCards from '../../components/report/OrderSummaryCards';
import RevenueSummaryCard from '../../components/report/RevenueSummaryCard';

const EMPTY_REVENUE = {
  totalRevenue: 0,
  completedOrderCount: 0,
};

export const ReportView = () => {
  const [revenue, setRevenue] = useState(EMPTY_REVENUE);
  const [products, setProducts] = useState([]);
  const [orderSummary, setOrderSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [revenueResponse, productsResponse, orderSummaryResponse] =
        await Promise.all([
          reportApi.getRevenueReport(),
          reportApi.getBestSellingProductsReport(),
          reportApi.getOrderSummaryReport(),
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
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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
          Revenue, best-selling products, and order summaries.
        </Text>
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
          <RevenueSummaryCard
            totalRevenue={revenue.totalRevenue}
            completedOrderCount={revenue.completedOrderCount}
            isLoading={isLoading}
          />
          <OrderSummaryCards
            summary={orderSummary}
            isLoading={isLoading}
          />
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
