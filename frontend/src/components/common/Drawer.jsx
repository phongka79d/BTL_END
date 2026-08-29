import React, { useEffect } from 'react';
import { Heading, VStack, Button } from '@astryxdesign/core';
import { CloseIcon } from './LayoutIcons';

/**
 * Drawer Component chuẩn hiển thị bảng trượt từ cạnh phải màn hình
 * @param {boolean} isOpen - Trạng thái mở
 * @param {Function} onClose - Handler đóng
 * @param {string} title - Tiêu đề Drawer
 * @param {string} [subtitle] - Phụ đề
 * @param {React.ReactNode} children - Nội dung Drawer
 * @param {React.ReactNode} [footer] - Nút hành động ở chân Drawer
 * @param {string} [width] - Chiều rộng Drawer (mặc định: "560px")
 */
export const Drawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = '560px'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="app-drawer-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        className="app-drawer-content"
        style={{
          width: '100%',
          maxWidth: width,
          height: '100%',
          backgroundColor: 'var(--color-background-surface)',
          color: 'var(--color-text-primary)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: 'slideInRight 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--spacing-4) var(--spacing-6)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-background-popover, var(--color-background-surface))'
          }}
        >
          <VStack gap={1}>
            <Heading level={2} style={{ margin: 0, fontSize: '1.25rem' }}>
              {title}
            </Heading>
            {subtitle && (
              <span style={{ fontSize: '0.875rem', opacity: 0.75 }}>
                {subtitle}
              </span>
            )}
          </VStack>

          <Button
            label="Đóng"
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<CloseIcon size={18} />}
          />
        </div>

        {/* Body */}
        <div
          style={{
            padding: 'var(--spacing-6)',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: 'var(--spacing-4) var(--spacing-6)',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background-popover, var(--color-background-surface))',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--spacing-3)'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
