import React, { useCallback, useEffect, useState } from 'react';
import { Button, Heading, HStack, Text, VStack } from '@astryxdesign/core';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../api/reportApi';
import Alert from '../components/common/Alert';
import OrderSummaryCards from '../components/report/OrderSummaryCards';
import RevenueSummaryCard from '../components/report/RevenueSummaryCard';
import { useAuth } from '../contexts/AuthContext';

const EMPTY_REVENUE = {
  totalRevenue: 0,
  completedOrderCount: 0,
};

export const AdminDashboardView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState(EMPTY_REVENUE);
  const [orderSummary, setOrderSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [revenueResponse, orderSummaryResponse] = await Promise.all([
        reportApi.getRevenueReport(),
        reportApi.getOrderSummaryReport(),
      ]);

      setRevenue(revenueResponse?.data || EMPTY_REVENUE);
      setOrderSummary(orderSummaryResponse?.data || {});
    } catch (err) {
      setRevenue(EMPTY_REVENUE);
      setOrderSummary({});
      setError(
        err?.status === 403
          ? 'You do not have permission to access admin report metrics.'
          : err?.message || 'Unable to load dashboard metrics. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <VStack gap={6} width="100%">
      <HStack
        gap={4}
        align="center"
        justify="between"
        wrap="wrap"
        width="100%"
      >
        <VStack gap={1}>
          <Heading level={1}>Dashboard</Heading>
          <Text color="secondary">
            Welcome back, {user?.fullName || user?.username || 'admin'}.
          </Text>
        </VStack>

        <HStack gap={2} wrap="wrap">
          <Button
            label="Refresh data"
            variant="secondary"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
          />
          <Button
            label="View reports"
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/reports')}
          />
        </HStack>
      </HStack>

      {error ? (
        <Alert
          title="Unable to load dashboard metrics"
          description={error}
          actionLabel="Retry"
          onAction={fetchMetrics}
        />
      ) : (
        <VStack gap={6} width="100%">
          <RevenueSummaryCard
            totalRevenue={revenue.totalRevenue}
            completedOrderCount={revenue.completedOrderCount}
            isLoading={isLoading}
          />
          <OrderSummaryCards
            summary={orderSummary}
            isLoading={isLoading}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default AdminDashboardView;
