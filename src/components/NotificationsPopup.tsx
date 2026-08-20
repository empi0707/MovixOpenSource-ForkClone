// STUB — Push notifications & API notifications removed.
import React from 'react';

interface NotificationsPopupProps {
  onClose: () => void;
  onNotificationUpdate?: (count: number) => void;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ onClose }) => {
  React.useEffect(() => { onClose(); }, [onClose]);
  return null;
};

export default NotificationsPopup;
