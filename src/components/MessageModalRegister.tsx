import { useEffect } from 'react';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { ToastService } from '@/utils/ToastService';

const MessageModalRegister = () => {
  const { show } = useMessageModal();

  useEffect(() => {
    // 注册全局toast服务，支持非组件中使用
    ToastService.register(show);
  }, [show]);

  return null; // 这个组件不渲染任何 UI
};

export default MessageModalRegister;