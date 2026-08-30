import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xóa',
  cancelLabel = 'Hủy',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="confirm-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          id="confirm-modal-dialog"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white/95 dark:bg-[#191428] rounded-2xl shadow-2xl border border-purple-100 dark:border-purple-950/80 p-6 overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                isDestructive
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 leading-snug">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>

            <button
              type="button"
              id="confirm-modal-close"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-purple-100 dark:border-purple-950/60">
            <button
              type="button"
              id="btn-confirm-cancel"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-purple-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 transition-all active:scale-98 cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              id="btn-confirm-accept"
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all active:scale-98 flex items-center gap-2 cursor-pointer ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-rose-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-500/20'
              }`}
            >
              {isDestructive && <Trash2 className="w-4 h-4" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
