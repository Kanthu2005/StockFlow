import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'danger',
  isLoading = false,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-900/40 backdrop-blur-[1px] transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-lg border border-zinc-200 shadow-xl overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-md shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                  {title}
                </h3>
                {description && (
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded hover:bg-zinc-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {children && <div className="mt-4 text-xs text-zinc-600">{children}</div>}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button
              variant="secondary"
              size="md"
              disabled={isLoading}
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            {onConfirm && (
              <Button
                variant={confirmVariant}
                size="md"
                loading={isLoading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
