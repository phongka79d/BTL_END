import React from 'react';
import {
  Card,
  EmptyState,
  Skeleton,
  Table,
  VStack
} from '@astryxdesign/core';
import Alert from '../common/Alert';

export const AdminTable = ({
  columns,
  data,
  emptyActions,
  emptyDescription,
  emptyTitle,
  error,
  errorTitle = 'Không thể tải dữ liệu',
  isLoading,
  onRetry
}) => {
  if (isLoading) {
    return (
      <Card padding={4}>
        <VStack gap={3} aria-label="Đang tải bảng">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton
              key={index}
              height="var(--spacing-10)"
              radius={2}
              index={index}
            />
          ))}
        </VStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        title={errorTitle}
        description={error}
        actionLabel="Thử lại"
        onAction={onRetry}
      />
    );
  }

  return (
    <Card padding={0} style={{ width: '100%', minWidth: 0 }}>
      <Table
        columns={columns}
        data={data}
        idKey="id"
        density="balanced"
        dividers="rows"
        hasHover
        textOverflow="truncate"
        emptyState={(
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actions={emptyActions}
            isCompact
          />
        )}
      />
    </Card>
  );
};

export default AdminTable;
