import { useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

export const Alert = ({
  title,
  description,
  status = 'error',
  actionLabel,
  onAction
}) => {
  const notification = useNotification();

  useEffect(() => {
    const normalizedStatus = ['success', 'error', 'warning', 'info'].includes(status) ? status : 'error';
    const dismiss = notification[normalizedStatus]({
      title,
      description,
      actionLabel,
      onAction,
      uniqueID: `${normalizedStatus}:${title}:${description || ''}`,
    });

    return dismiss;
  }, [actionLabel, description, notification, onAction, status, title]);

  return null;
};

export default Alert;
