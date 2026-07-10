import React, { useCallback, useMemo } from 'react';
import {
  Badge,
  Button,
  HStack,
  Text,
  VStack
} from '@astryxdesign/core';
import { ToastViewport, useToast } from '@astryxdesign/core/Toast';

const NOTIFICATION_CONFIG = {
  success: {
    label: 'Thành công',
    badgeVariant: 'success',
    toastType: 'info',
    autoHideDuration: 6000,
  },
  error: {
    label: 'Lỗi',
    badgeVariant: 'error',
    toastType: 'info',
    autoHideDuration: 10000,
  },
  warning: {
    label: 'Cảnh báo',
    badgeVariant: 'warning',
    toastType: 'info',
    autoHideDuration: 8000,
  },
  info: {
    label: 'Thông tin',
    badgeVariant: 'info',
    toastType: 'info',
    autoHideDuration: 6000,
  },
};

const getNotificationType = (type) => (
  Object.prototype.hasOwnProperty.call(NOTIFICATION_CONFIG, type) ? type : 'info'
);

const createToastBody = ({ title, description, type }) => {
  const config = NOTIFICATION_CONFIG[type];

  return (
    <VStack gap={2}>
      <HStack gap={2} align="center" wrap="wrap">
        <Badge variant={config.badgeVariant} label={config.label} />
        <Text weight="semibold">{title}</Text>
      </HStack>
      {description && (
        <Text color="secondary">{description}</Text>
      )}
    </VStack>
  );
};

const createAction = ({ actionLabel, onAction }) => {
  if (!actionLabel || !onAction) {
    return undefined;
  }

  return (
    <Button
      label={actionLabel}
      variant="secondary"
      size="sm"
      onClick={onAction}
    />
  );
};

export const useNotification = () => {
  const toast = useToast();

  const notify = useCallback((type, options) => {
    const notificationType = getNotificationType(type);
    const config = NOTIFICATION_CONFIG[notificationType];
    const title = options?.title || options?.message || config.label;
    const description = options?.description || '';

    return toast({
      body: createToastBody({
        title,
        description,
        type: notificationType,
      }),
      type: config.toastType,
      isAutoHide: true,
      autoHideDuration: options?.autoHideDuration || config.autoHideDuration,
      endContent: createAction(options || {}),
      uniqueID: options?.uniqueID,
      collisionBehavior: options?.collisionBehavior || 'overwrite',
    });
  }, [toast]);

  return useMemo(() => ({
    success: (options) => notify('success', options),
    error: (options) => notify('error', options),
    warning: (options) => notify('warning', options),
    info: (options) => notify('info', options),
    show: (options) => notify(options?.type || 'info', options),
  }), [notify]);
};

export const NotificationProvider = ({ children }) => {
  return (
    <ToastViewport
      position="topEnd"
      maxVisible={4}
    >
      {children}
    </ToastViewport>
  );
};

export default NotificationProvider;
