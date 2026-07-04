import React from 'react';
import { Button, HStack, Text } from '@astryxdesign/core';

export const Pagination = ({
  page,
  totalPages,
  onPageChange
}) => {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <HStack
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--spacing-3)'
      }}
    >
      <Text size="supporting" color="secondary">
        Page {page} of {totalPages}
      </Text>
      <HStack gap={2}>
        <Button
          label="Previous"
          variant="secondary"
          isDisabled={!canGoPrevious}
          onClick={() => onPageChange(page - 1)}
        />
        <Button
          label="Next"
          variant="secondary"
          isDisabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
        />
      </HStack>
    </HStack>
  );
};

export default Pagination;
