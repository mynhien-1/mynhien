import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, ExternalLink, QrCode } from 'lucide-react';
import { ResourceLink, Category } from '../types';
import { copyToClipboard, extractDomain, getFaviconUrl } from '../services/storage';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: ResourceLink | null;
  category?: Category;
  onNotify: (msg: string) => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  link,
  category,
  onNotify,
}) => {
  const [copiedType, setCopiedType] = useState<'url' | 'full' | null>(null);

  if (!isOpen || !link) return null;

  const formattedShareText = `📖 TÀI NGUYÊN KHỐI HAI\n🌟 ${link.title}\n🔗 ${link.url}${link.description ? `\n📝 ${link.description}` : ''}${category ? `\n📁 Danh mục: ${category.name}` : ''}`;

  const handleCopyUrl = async () => {
    const ok = await copyToClipboard(link.url);
    if (ok) {
      setCopiedType('url');
      onNotify('Đã sao chép liên kết vào bộ nhớ tạm!');
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleCopyFull = async () => {
    const ok = await copyToClipboard(formattedShareText);
    if (ok) {
      setCopiedType('full');
      onNotify('Đã sao chép nội dung chia sẻ (Tên + Đường dẫn)!');
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: link.description ? `${link.title} - ${link.description}` : link.title,
          url: link.url,
        });
        onNotify('Đã mở giao diện chia sẻ!');
      } catch (err) {
        // User cancelled or aborted
      }
    } else {
      handleCopyFull();
    }
  };

  const faviconUrl = getFaviconUrl(link.url);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link.url)}`;

  return (
    <AnimatePresence>
      <div
        id="share-link-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          id="share-link-modal-dialog"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white/95 dark:bg-[#191428] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-950/80 p-6 overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-purple-100 dark:border-purple-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100/70 dark:bg-purple-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
                  Chia sẻ liên kết
                </h3>
                <p className="text-xs text-blue-700/80 dark:text-blue-300/80 truncate max-w-[220px]">
                  {link.title}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* Card preview */}
            <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-xs border border-purple-100 dark:border-slate-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 leading-tight">
                    {link.title}
                  </h4>
                  <p className="text-xs text-blue-700/70 dark:text-blue-300/70 truncate mt-0.5">
                    {link.url}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-center p-3 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/60">
              <div className="text-center">
                <div className="p-2 bg-white rounded-xl shadow-xs inline-block border border-purple-100">
                  <img src={qrUrl} alt="Mã QR liên kết" className="w-28 h-28 mx-auto" />
                </div>
                <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-1.5 flex items-center justify-center gap-1">
                  <QrCode className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Quét mã để mở trên điện thoại
                </p>
              </div>
            </div>

            {/* Structured text box preview */}
            <div>
              <div className="flex items-center justify-between mb-1 text-xs text-blue-800 dark:text-blue-300 font-medium">
                <span>Nội dung gửi tin nhắn (Zalo, Messenger):</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 border border-purple-200/80 dark:border-slate-700 whitespace-pre-line max-h-24 overflow-y-auto">
                {formattedShareText}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              id="btn-copy-formatted-share"
              onClick={handleCopyFull}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {copiedType === 'full' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'full' ? 'Đã sao chép nội dung!' : 'Sao chép nội dung chia sẻ'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-copy-single-url"
                onClick={handleCopyUrl}
                className="py-2.5 px-3 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedType === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                Chỉ sao chép URL
              </button>

              <button
                type="button"
                id="btn-native-share"
                onClick={handleNativeShare}
                className="py-2.5 px-3 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Gửi qua ứng dụng
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
