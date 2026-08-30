import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, RotateCcw, AlertTriangle, Sparkles, FolderX } from 'lucide-react';
import { ResourceLink, Category } from '../types';
import { extractDomain, getFaviconUrl } from '../services/storage';
import { CategoryIcon, getCategoryColor } from './IconHelper';

interface TrashViewProps {
  trashLinks: ResourceLink[];
  categories: Category[];
  onRestore: (link: ResourceLink) => void;
  onRestoreAll: () => void;
  onPermanentDelete: (link: ResourceLink) => void;
  onEmptyTrash: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  trashLinks,
  categories,
  onRestore,
  onRestoreAll,
  onPermanentDelete,
  onEmptyTrash,
}) => {
  const getCat = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/95 dark:bg-[#191428] border border-purple-100 dark:border-purple-950/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-blue-900 dark:text-blue-200">
              Thùng rác ({trashLinks.length} liên kết)
            </h2>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
              Các liên kết đã xóa tạm thời. Bạn có thể khôi phục lại kho hoặc xóa vĩnh viễn.
            </p>
          </div>
        </div>

        {trashLinks.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-restore-all-trash"
              onClick={onRestoreAll}
              className="px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Khôi phục tất cả
            </button>

            <button
              type="button"
              id="btn-empty-trash"
              onClick={onEmptyTrash}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Dọn sạch thùng rác
            </button>
          </div>
        )}
      </div>

      {/* Items list */}
      {trashLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white/95 dark:bg-[#191428] border border-purple-100 dark:border-purple-950/60">
          <div className="w-16 h-16 rounded-3xl bg-purple-100/70 dark:bg-slate-800 flex items-center justify-center text-blue-500 mb-4">
            <FolderX className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
            Thùng rác trống
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Hiện không có liên kết nào trong thùng rác. Mọi liên kết bạn xóa sẽ xuất hiện tại đây trước khi xóa hẳn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {trashLinks.map((link) => {
              const cat = getCat(link.categoryId);
              const col = getCategoryColor(cat?.color);
              const domain = extractDomain(link.url);
              const favicon = getFaviconUrl(link.url);

              return (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-2xl bg-white/95 dark:bg-[#191428] border border-purple-100 dark:border-purple-950/60 flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={favicon}
                        alt="icon"
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 line-clamp-1">
                        {link.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{domain}</p>
                      {link.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1.5">
                          {link.description}
                        </p>
                      )}
                      {cat && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${col.badge}`}
                          >
                            <CategoryIcon iconName={cat.iconName} className="w-3 h-3" />
                            {cat.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-100/80 dark:border-purple-950/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      {link.deletedAt
                        ? `Xóa ngày: ${new Date(link.deletedAt).toLocaleDateString('vi-VN')}`
                        : 'Trong thùng rác'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id={`btn-restore-link-${link.id}`}
                        onClick={() => onRestore(link)}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Khôi phục
                      </button>

                      <button
                        type="button"
                        id={`btn-perm-delete-${link.id}`}
                        onClick={() => onPermanentDelete(link)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Xóa vĩnh viễn
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
