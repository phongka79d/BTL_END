import React from 'react';
import { Card, Heading, Text, HStack, VStack, Badge } from '@astryxdesign/core';

/**
 * StatCard Component hiển thị chỉ số thống kê gọn gàng, trực quan chuẩn Astryx Design System
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
  variant = 'default',
  onClick,
  className = ''
}) => {
  const getTrendBadgeVariant = (type) => {
    if (type === 'up') return 'success';
    if (type === 'down') return 'danger';
    return 'default';
  };

  return (
    <Card
      padding={4}
      className={`app-stat-card app-stat-card--${variant} ${className}`}
      onClick={onClick}
      style={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      <VStack gap={3} justify="between" style={{ height: '100%' }}>
        <VStack gap={2}>
          <HStack justify="between" align="center">
            <Text color="secondary" size="sm" weight="semibold">
              {title}
            </Text>
            {icon && (
              <span style={{ opacity: 0.85, display: 'flex', alignItems: 'center' }}>
                {icon}
              </span>
            )}
          </HStack>

          <div>
            <Heading level={2} style={{ margin: 0, letterSpacing: '-0.02em' }}>
              {value}
            </Heading>
          </div>
        </VStack>

        {(subtitle || trend) && (
          <HStack justify="between" align="center" style={{ marginTop: 'var(--spacing-2)' }}>
            {subtitle && (
              <Text size="supporting" color="secondary">
                {subtitle}
              </Text>
            )}
            {trend && (
              <Badge variant={getTrendBadgeVariant(trendType)} size="sm">
                {trend}
              </Badge>
            )}
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

export default StatCard;
