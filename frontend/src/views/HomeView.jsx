import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  Icon
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';

/**
 * HomeView Component
 * Renders a premium promotional landing page for TechMart.
 * Proves that the main customer shell works without implementing product browsing.
 */
export const HomeView = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <VStack
      style={{
        gap: 'var(--spacing-8)',
        maxWidth: '1200px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)',
        width: '100%'
      }}
    >
      {/* Hero Section */}
      <Card
        style={{
          padding: 'var(--spacing-8)',
          background: 'linear-gradient(135deg, var(--color-background-surface) 0%, var(--color-overlay-hover) 100%)',
          borderRadius: 'var(--radius-container)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--elevation-2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <VStack gap={4} style={{ maxWidth: '640px' }}>
          <HStack style={{ alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <Icon icon="wrench" color="accent" size="lg" />
            <Text weight="semibold" color="accent" size="supporting">
              Introducing TechMart
            </Text>
          </HStack>
          
          <Heading level={1} style={{ fontSize: 'var(--text-title-1-size)', fontWeight: 'var(--font-weight-bold)' }}>
            Your Destination for Premium Electronics
          </Heading>
          
          <Text size="body" color="secondary">
            Explore state-of-the-art gadgets, computer hardware, audio equipment, and smart devices. Curated quality with local service and support.
          </Text>

          {isAuthenticated ? (
            <VStack gap={2}>
              <Text size="body" weight="medium">
                Welcome back, {user?.fullName || user?.username || 'Customer'}!
              </Text>
              <HStack gap={3}>
                <Button
                  label="View Profile"
                  variant="primary"
                  onClick={() => navigate('/profile')}
                />
                {user?.role === 'admin' && (
                  <Button
                    label="Admin Console"
                    variant="secondary"
                    onClick={() => navigate('/admin')}
                  />
                )}
              </HStack>
            </VStack>
          ) : (
            <HStack gap={3}>
              <Button
                label="Sign In"
                variant="primary"
                onClick={() => navigate('/login')}
              />
              <Button
                label="Create Account"
                variant="secondary"
                onClick={() => navigate('/register')}
              />
            </HStack>
          )}
        </VStack>
      </Card>

      {/* Featured Categories (Promo / Placeholder) */}
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Shop by Category</Heading>
          <Text color="secondary">Discover our wide range of professional-grade electronics</Text>
        </VStack>

        <HStack
          style={{
            flexWrap: 'wrap',
            gap: 'var(--spacing-4)',
            width: '100%'
          }}
        >
          {[
            { title: 'Laptops & Computers', desc: 'High-performance rigs and accessories', icon: 'wrench' },
            { title: 'Smartphones & Tablets', desc: 'The latest mobile tech and accessories', icon: 'wrench' },
            { title: 'Audio & Entertainment', desc: 'Premium sound systems and headphones', icon: 'wrench' },
            { title: 'Smart Home & IOT', desc: 'Automation for your modern living space', icon: 'wrench' }
          ].map((cat, idx) => (
            <Card
              key={idx}
              style={{
                flex: '1 1 240px',
                padding: 'var(--spacing-5)',
                backgroundColor: 'var(--color-background-surface)',
                borderRadius: 'var(--radius-element)',
                border: '1px solid var(--color-border)',
                transition: 'transform var(--duration-fast), box-shadow var(--duration-fast)',
                cursor: 'pointer',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--elevation-1)',
                  borderColor: 'var(--color-accent)'
                }
              }}
            >
              <VStack gap={3}>
                <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Icon icon={cat.icon} color="accent" />
                  <Icon icon="wrench" color="secondary" size="sm" />
                </HStack>
                <VStack gap={1}>
                  <Text weight="semibold">{cat.title}</Text>
                  <Text size="supporting" color="secondary">{cat.desc}</Text>
                </VStack>
              </VStack>
            </Card>
          ))}
        </HStack>
      </VStack>

      {/* Phase Placeholder Section */}
      <Card
        style={{
          padding: 'var(--spacing-6)',
          backgroundColor: 'var(--color-background-surface)',
          borderRadius: 'var(--radius-element)',
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}
      >
        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Heading level={3}>Looking for products?</Heading>
          <Text size="supporting" color="secondary" style={{ maxWidth: '600px' }}>
            The full catalog browser, search, and ordering system are currently scheduled for Phase 2. This page confirms that the shell layout and design tokens are successfully compiled and active!
          </Text>
        </VStack>
      </Card>
    </VStack>
  );
};

export default HomeView;
