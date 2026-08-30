import React from 'react';
import { motion } from 'motion/react';
import {
  CheckSquare,
  X,
  Trash2,
  Star,
  Pin,
  FolderInput,
  Copy,
  Check,
} from 'lucide-react';
import { Category } from '../types';

interface BatchActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchFavorite: (favorite: boolean) => void;
  onBatchPin: (pinned: boolean) => void;
  onBatchChangeCategory: (categoryId: string) => void;
  onBatchDelete: () => void;
  onBatchCopyUrls: () => void;
  categories: Category[];
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBatchFavorite,
  onBatchPin,
  onBatchChangeCategory,
  onBatchDelete,
  onBatchCopyUrls,
  categories,
}) => {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      id="batch-action-bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3"
    >
      {/* Selection info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
          {selectedCount}
        </div>
        <div>
          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <span>Đã chọn {selectedCount} / {totalCount} liên kết</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline cursor-pointer"
            >
              Chọn tất cả ({totalCount})
            </button>
            <span className="text-slate-500">•</span>
            <button
              type="button"
              onClick={onDeselectAll}
              className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      </div>

      {/* Batch Operations */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Copy all URLs */}
        <button
          type="button"
          onClick={onBatchCopyUrls}
          title="Sao chép toàn bộ liên kết đã chọn"
          className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Sao chép URLs</span>
        </button>

        {/* Batch Favorite */}
        <button
          type="button"
          onClick={() => onBatchFavorite(true)}
          title="Thêm vào yêu thích"
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-yellow-500/20 hover:text-yellow-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="hidden sm:inline">Yêu thích</span>
        </button>

        {/* Batch Pin */}
        <button
          type="button"
          onClick={() => onBatchPin(true)}
          title="Ghim lên đầu danh sách"
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-amber-500/20 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Pin className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Ghim</span>
        </button>

        {/* Change Category Selector */}
        <div className="relative inline-flex items-center">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onBatchChangeCategory(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-xs font-semibold text-slate-200 py-1.5 px-2.5 rounded-xl border border-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="" disabled>
              📁 Chuyển danh mục...
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Delete */}
        <button
          type="button"
          onClick={onBatchDelete}
          title="Xóa các liên kết đã chọn"
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Xóa</span>
        </button>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDeselectAll}
          title="Đóng thanh thao tác"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
