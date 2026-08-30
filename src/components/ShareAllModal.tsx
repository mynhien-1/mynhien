import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, FileText, Send, Download, Sparkles } from 'lucide-react';
import { ResourceLink, Category } from '../types';
import { copyToClipboard, generateShareableVaultText, StorageService } from '../services/storage';

interface ShareAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: ResourceLink[];
  categories: Category[];
  onNotify: (msg: string) => void;
}

export const ShareAllModal: React.FC<ShareAllModalProps> = ({
  isOpen,
  onClose,
  links,
  categories,
  onNotify,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const activeLinks = links.filter((l) => !l.isTrash);
  const formattedVaultText = generateShareableVaultText(links, categories);

  const handleCopyText = async () => {
    const ok = await copyToClipboard(formattedVaultText);
    if (ok) {
      setCopiedText(true);
      onNotify('Đã sao chép toàn bộ danh sách liên kết! Bạn có thể dán vào Zalo/Messenger/Email để gửi cho đồng nghiệp.');
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleCopyShareLink = async () => {
    const shareUrl = window.location.origin + window.location.pathname;
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopiedLink(true);
      onNotify('Đã sao chép đường dẫn ứng dụng!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = StorageService.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tai-Nguyen-Khoi-Hai-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Đã tải xuống tệp sao lưu kho liên kết!');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kho Liên Kết Thông Minh - Tài Nguyên Khối Hai',
          text: formattedVaultText,
          url: window.location.href,
        });
        onNotify('Đã mở chia sẻ hệ thống!');
      } catch {
        // user cancelled
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <AnimatePresence>
      <div
        id="share-all-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          id="share-all-modal-dialog"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white/95 dark:bg-[#191428] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-950/80 p-6 my-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-purple-100 dark:border-purple-950/60">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                  Chia sẻ toàn bộ kho liên kết
                </h3>
                <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
                  Tạo nội dung tổng hợp gồm {activeLinks.length} tài nguyên theo danh mục để gửi cho giáo viên
                </p>
              </div>
            </div>
            <button
              type="button"
              id="share-all-close-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-5 space-y-4">
            {/* Quick action bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-copy-vault-text-primary"
                onClick={handleCopyText}
                className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-98 cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedText ? 'Đã sao chép nội dung!' : 'Sao chép nội dung chia sẻ'}
              </button>

              <button
                type="button"
                id="btn-native-share-vault"
                onClick={handleNativeShare}
                className="py-3 px-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100/60 dark:hover:bg-blue-900/60 transition-all active:scale-98 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Gửi trực tiếp qua ứng dụng (Zalo/Apps)
              </button>
            </div>

            {/* Preview Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Xem trước nội dung văn bản chia sẻ
                </span>
                <span className="text-xs text-blue-700/70 dark:text-blue-300/70">
                  {categories.length} danh mục • {activeLinks.length} liên kết
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-slate-800/70 border border-purple-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed select-all">
                {formattedVaultText}
              </div>
            </div>

            {/* Secondary actions: Download JSON & Copy Web Link */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-purple-100 dark:border-purple-950/60">
              <button
                type="button"
                id="btn-download-vault-backup"
                onClick={handleDownloadJSON}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 border border-purple-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Xuất tệp sao lưu (.JSON)
              </button>

              <button
                type="button"
                id="btn-copy-web-link"
                onClick={handleCopyShareLink}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 border border-purple-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                {copiedLink ? 'Đã sao chép link app!' : 'Sao chép link ứng dụng'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
