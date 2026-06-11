import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(() => {});

const STYLES = {
  success: { bar: 'bg-secondary', Icon: CheckCircle, color: 'text-secondary' },
  error: { bar: 'bg-error', Icon: AlertCircle, color: 'text-error' },
  info: { bar: 'bg-primary', Icon: Info, color: 'text-primary' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const remove = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const addToast = useCallback((message, type = 'info') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => {
          const { bar, Icon, color } = STYLES[toast.type] || STYLES.info;
          return (
            <div key={toast.id} className="flex items-start gap-3 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl animate-in slide-in-from-right-4">
              <div className={`w-1.5 self-stretch ${bar}`} />
              <Icon size={20} className={`mt-3 shrink-0 ${color}`} />
              <p className="flex-1 py-3 text-body-md text-on-surface">{toast.message}</p>
              <button type="button" onClick={() => remove(toast.id)} aria-label="Dismiss" className="p-3 text-outline hover:text-on-surface">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
