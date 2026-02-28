import React, { useState, useEffect } from 'react';
import { CustomAlert } from './CustomAlert';
import { customAlertManager } from '../utils/customAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleShow = (config: AlertConfig) => {
      setAlertConfig(config);
      setVisible(true);
    };

    const handleHide = () => {
      setVisible(false);
      setTimeout(() => setAlertConfig(null), 300);
    };

    customAlertManager.on('show', handleShow);
    customAlertManager.on('hide', handleHide);

    return () => {
      customAlertManager.off('show', handleShow);
      customAlertManager.off('hide', handleHide);
    };
  }, []);

  return (
    <>
      {children}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={() => setVisible(false)}
        />
      )}
    </>
  );
};
