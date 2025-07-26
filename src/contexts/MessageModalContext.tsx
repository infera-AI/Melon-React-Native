import React, { createContext, useContext, useState, ReactNode } from 'react';
import MessageModal from '../components/MessageModal';

type ModalOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: () => void;
};

type MessageModalContextType = {
  show: (options: ModalOptions) => void;
  hide: () => void;
};

const MessageModalContext = createContext<MessageModalContextType | undefined>(undefined);

export const MessageModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ModalOptions>({ message: '' });

  const show = (opts: ModalOptions) => {
    console.log('show', opts);
    setOptions(opts);
    setVisible(true);
  };

  const hide = () => setVisible(false);

  return (
    <MessageModalContext.Provider value={{ show, hide }}>
      {children}
      <MessageModal
        visible={visible}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        onClose={hide}
        onConfirm={() => {
          options.onConfirm?.();
          hide();
        }}
        showCancel={options.showCancel}
        cancelText={options.cancelText}
        onCancel={() => {
          options.onCancel?.();
          hide();
        }}
      />
    </MessageModalContext.Provider>
  );
};

export const useMessageModal = () => {
  const ctx = useContext(MessageModalContext);
  if (!ctx) {
    throw new Error('useMessageModal must be used within MessageModalProvider');
  }
  return ctx;
}; 