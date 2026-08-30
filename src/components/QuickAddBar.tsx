import React, { useState } from 'react';
import { Plus, Link2, Wand2, Clipboard, ArrowRight } from 'lucide-react';
import { Category, ResourceLink } from '../types';
import { isValidUrl, normalizeUrl, extractDomain, detectLinkMetadata } from '../services/storage';

interface QuickAddBarProps {
  categories: Category[];
  onQuickAdd: (linkData: Partial<ResourceLink>) => void;
  onOpenFullModal: (prefillUrl?: string) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  categories,
  onQuickAdd,
  onOpenFullModal,
}) => {
  const [url, setUrl] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized)) {
      // If not fully valid or user wants to customize, open full modal
      onOpenFullModal(url);
      return;
    }

    const suggestion = detectLinkMetadata(normalized, categories);
    const finalCatId = selectedCatId || suggestion.suggestedCategoryId || categories[0]?.id || 'cat-khac';

    onQuickAdd({
      url: normalized,
      title: suggestion.suggestedTitle || extractDomain(normalized),
      categoryId: finalCatId,
      description: suggestion.suggestedDescription || '',
      tags: suggestion.suggestedTags || [],
      isFavorite: false,
      isPinned: false,
      clickCount: 0,
    });

    setUrl('');
    setSelectedCatId('');
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          const suggestion = detectLinkMetadata(normalizeUrl(text), categories);
          if (suggestion.suggestedCategoryId) {
            setSelectedCatId(suggestion.suggestedCategoryId);
          }
        }
      }
    } catch {
      // clipboard access denied
    }
  };

  return (
    <div
      id="quick-add-bar-container"
      className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 dark:from-[#1b1430] dark:via-[#1f1738] dark:to-[#17132a] p-4 sm:p-5 rounded-3xl text-white shadow-xl border border-blue-700/40 dark:border-purple-900/60 relative overflow-hidden"
    >
      {/* Background glowing ambient light */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              Thêm nhanh liên kết dạy học
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-blue-200">
            Dán URL bất kỳ, hệ thống sẽ tự nhận diện môn học và tên bài
          </p>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleQuickSubmit} className="flex flex-col md:flex-row items-stretch gap-2">
          {/* URL Input Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-300">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="quick-url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Dán link vào đây (Quizizz, Canva, YouTube, SGK điện tử, VioEdu...)"
              className="w-full pl-10 pr-24 py-3 rounded-2xl bg-white/10 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700 text-white placeholder-indigo-200/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all backdrop-blur-sm"
            />
            {/* Quick paste button */}
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Dán từ bộ nhớ tạm"
            >
              <Clipboard className="w-3 h-3" />
              <span className="hidden sm:inline">Dán</span>
            </button>
          </div>

          {/* Category Selector */}
          <select
            id="quick-category-select"
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="px-3 py-3 rounded-2xl bg-white/10 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-white/40 cursor-pointer backdrop-blur-sm md:w-48"
          >
            <option value="" className="bg-slate-900 text-white">
              ⚡ Tự động nhận diện môn
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>

          {/* Quick Submit button */}
          <button
            type="submit"
            id="quick-add-submit-btn"
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Lưu ngay</span>
          </button>

          {/* Full modal button */}
          <button
            type="button"
            onClick={() => onOpenFullModal(url)}
            className="px-3 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer flex-shrink-0"
            title="Mở bảng nhập đầy đủ thông tin (gắn thẻ, ghi chú chi tiết)"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chi tiết hơn</span>
          </button>
        </form>
      </div>
    </div>
  );
};
