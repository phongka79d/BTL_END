import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  Icon,
  Button
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';

/**
 * AdminDashboardView Component
 * Renders a placeholder dashboard for administrative users.
 * Showcases system metrics and placeholder controls.
 */
export const AdminDashboardView = () => {
  const { user } = useAuth();

  return (
    <VStack gap={6} style={{ width: '100%' }}>
      {/* Header and Welcome */}
      <HStack style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
        <VStack gap={1}>
          <Heading level={1}>Dashboard</Heading>
          <Text size="supporting" color="secondary">
            Welcome back, admin <strong>{user?.fullName || user?.username || 'User'}</strong>
          </Text>
        </VStack>
        <Button
          label="Refresh Data"
          variant="secondary"
          size="sm"
          onClick={() => alert('Data refreshed (mocked)')}
        />
      </HStack>

      {/* Metrics Row */}
      <HStack style={{ flexWrap: 'wrap', gap: 'var(--spacing-4)', width: '100%' }}>
        {[
          { title: 'Total Sales', value: '$12,850.40', icon: 'wrench', color: 'accent', change: '+14.5% vs last month' },
          { title: 'Active Products', value: '412 items', icon: 'wrench', color: 'secondary', change: 'Across 8 categories' },
          { title: 'Registered Users', value: '1,248 accounts', icon: 'wrench', color: 'secondary', change: '8 new registrations today' },
          { title: 'Pending Orders', value: '15 orders', icon: 'wrench', color: 'accent', change: 'Requires fulfillment attention' }
        ].map((item, idx) => (
          <Card
            key={idx}
            style={{
              flex: '1 1 220px',
              padding: 'var(--spacing-5)',
              backgroundColor: 'var(--color-background-surface)',
              borderRadius: 'var(--radius-element)',
              border: '1px solid var(--color-border)'
            }}
          >
            <VStack gap={3}>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="supporting" color="secondary" weight="medium">{item.title}</Text>
                <Icon icon={item.icon} color={item.color} />
              </HStack>
              <VStack gap={1}>
                <Text size="large" weight="bold">{item.value}</Text>
                <Text size="supporting" color="secondary" style={{ fontSize: 'var(--text-caption-size)' }}>{item.change}</Text>
              </VStack>
            </VStack>
          </Card>
        ))}
      </HStack>

      {/* Main Content Details */}
      <HStack style={{ flexWrap: 'wrap', gap: 'var(--spacing-6)', width: '100%' }}>
        {/* Left Side: System info */}
        <Card
          style={{
            flex: '2 1 400px',
            padding: 'var(--spacing-6)',
            backgroundColor: 'var(--color-background-surface)',
            borderRadius: 'var(--radius-element)',
            border: '1px solid var(--color-border)'
          }}
        >
          <VStack gap={4}>
            <Heading level={2}>Admin Operations</Heading>
            <Text size="body" color="secondary">
              Use the sidebar panel navigation to access specific resources like Products, Categories, Orders, and Users. Currently in <strong>Phase 1 MVC Foundation</strong> mode.
            </Text>

            <VStack gap={3} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)' }}>
              <Text weight="semibold">Phase 1 Integration Targets:</Text>
              <ul style={{ 
                margin: 0, 
                paddingLeft: 'var(--spacing-4)', 
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--text-body-leading)',
                fontSize: 'var(--text-body-size)'
              }}>
                <li>Secure router guard is active and restricting normal clients.</li>
                <li>Admin layout provides responsive side navigation drawer.</li>
                <li>Connected to backend Auth API matching the Prisma User model.</li>
              </ul>
            </VStack>
          </VStack>
        </Card>

        {/* Right Side: Quick Logs / Phase 2 preview */}
        <Card
          style={{
            flex: '1 1 280px',
            padding: 'var(--spacing-6)',
            backgroundColor: 'var(--color-background-surface)',
            borderRadius: 'var(--radius-element)',
            border: '1px solid var(--color-border)'
          }}
        >
          <VStack gap={4}>
            <Heading level={3}>Scope Status</Heading>
            <Text size="supporting" color="secondary">
              Charts, reporting logs, and CRUD databases are currently out of scope for Phase 1.
            </Text>
            
            <VStack gap={2} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)' }}>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="supporting" weight="medium">User CRUD</Text>
                <Text size="supporting" color="secondary">Phase 1 (Ready)</Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="supporting" weight="medium">Product Catalog CRUD</Text>
                <Text size="supporting" color="secondary">Phase 2 (Out of Scope)</Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="supporting" weight="medium">Order Processing</Text>
                <Text size="supporting" color="secondary">Phase 3 (Out of Scope)</Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="supporting" weight="medium">Advanced Reports</Text>
                <Text size="supporting" color="secondary">Phase 4 (Out of Scope)</Text>
              </HStack>
            </VStack>
          </VStack>
        </Card>
      </HStack>
    </VStack>
  );
};

export default AdminDashboardView;
