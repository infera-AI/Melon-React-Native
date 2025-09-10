let func: ((key: string) => string) | '' = '';

export const i18nService = {
  register(fn: (key: string) => string) {
    func = fn;
  },
  t(key: string) {
    if (func) {
      return func(key);
    } else {
      console.warn('i18nService not registered yet.');
      return '';
    }
  }
};