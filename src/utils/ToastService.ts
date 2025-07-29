import type { ModalOptions } from "@/contexts/MessageModalContext"

let toast: ((msg: ModalOptions) => void) | null = null;

export const ToastService = {
  register(fn: (msg: ModalOptions) => void) {
    toast = fn;
  },
  show(msg: ModalOptions) {
    if (toast) {
      toast(msg);
    } else {
      console.warn('Toast function not registered yet.');
    }
  }
};