import React from 'react';
import { Dialog, Button, Text, Heading, HStack, VStack } from '@astryxdesign/core';

/**
 * ConfirmationDialog Component chuẩn cho các hộp thoại xác nhận hành động
 * @param {boolean} isOpen - Trạng thái mở hộp thoại
 * @param {Function} onClose - Handler đóng hộp thoại
 * @param {Function} onConfirm - Handler xác nhận hành động
 * @param {string} title - Tiêu đề hộp thoại
 * @param {string|React.ReactNode} message - Nội dung thông báo
 * @param {string} [confirmLabel] - Nhãn nút xác nhận (mặc định: "Xác nhận")
 * @param {string} [cancelLabel] - Nhãn nút hủy (mặc định: "Hủy")
 * @param {string} [variant] - Biến thể ('danger' | 'warning' | 'primary')
 * @param {boolean} [loading] - Trạng thái đang xử lý
 */
export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'primary',
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onClose} purpose="form">
      <VStack gap={5} style={{ minWidth: '320px', maxWidth: '480px', padding: 'var(--spacing-4)' }}>
        <VStack gap={2}>
          <Heading level={3} style={{ margin: 0, fontWeight: 600, fontSize: '1.25rem' }}>
            {title}
          </Heading>
          {typeof message === 'string' ? (
            <Text size="sm" style={{ color: 'var(--color-text-secondary, #6b7280)', margin: 0 }}>
              {message}
            </Text>
          ) : (
            message
          )}
        </VStack>

        <HStack justify="end" gap={3}>
          <Button
            label={cancelLabel}
            variant="secondary"
            onClick={onClose}
            isDisabled={loading}
          />
          <Button
            label={confirmLabel}
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            isLoading={loading}
            isDisabled={loading}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
};

export default ConfirmationDialog;
