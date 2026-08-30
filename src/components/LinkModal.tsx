import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link2, Sparkles, Tag, Plus, Pin, Star, Check, AlertCircle, Globe, Clipboard, Wand2 } from 'lucide-react';
import { Category, ResourceLink } from '../types';
import { isValidUrl, normalizeUrl, extractDomain, getFaviconUrl, detectLinkMetadata } from '../services/storage';
import { CategoryIcon, getCategoryColor } from './IconHelper';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: Partial<ResourceLink>) => void;
  categories: Category[];
  initialData?: ResourceLink | null;
  onOpenCreateCategory?: () => void;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
  onOpenCreateCategory,
}) => {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setUrl(initialData.url || '');
        setDescription(initialData.description || '');
        setCategoryId(initialData.categoryId || categories[0]?.id || 'cat-khac');
        setTags(initialData.tags || []);
        setIsPinned(Boolean(initialData.isPinned));
        setIsFavorite(Boolean(initialData.isFavorite));
      } else {
        setTitle('');
        setUrl('');
        setDescription('');
        setCategoryId(categories[0]?.id || 'cat-khac');
        setTags([]);
        setIsPinned(false);
        setIsFavorite(false);
      }
      setTagInput('');
      setErrors({});
    }
  }, [isOpen, initialData, categories]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Smart URL suggestion & auto fill
  const applySmartInference = (inputUrl: string) => {
    if (!inputUrl.trim()) return;
    const normalized = normalizeUrl(inputUrl);
    const suggestion = detectLinkMetadata(normalized, categories);

    if (!title.trim() && suggestion.suggestedTitle) {
      setTitle(suggestion.suggestedTitle);
    }
    if ((!categoryId || categoryId === 'cat-khac' || categoryId === categories[0]?.id) && suggestion.suggestedCategoryId) {
      setCategoryId(suggestion.suggestedCategoryId);
    }
    if (tags.length === 0 && suggestion.suggestedTags.length > 0) {
      setTags(suggestion.suggestedTags);
    }
    if (!description.trim() && suggestion.suggestedDescription) {
      setDescription(suggestion.suggestedDescription);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim()) {
      const normalized = normalizeUrl(url);
      setUrl(normalized);
      applySmartInference(normalized);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http') || text.includes('.'))) {
          const norm = normalizeUrl(text);
          setUrl(norm);
          applySmartInference(norm);
        }
      }
    } catch {
      // User may have denied clipboard permission
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; url?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tên liên kết.';
    }

    if (!url.trim()) {
      newErrors.url = 'Vui lòng nhập địa chỉ liên kết (URL).';
    } else if (!isValidUrl(url)) {
      newErrors.url = 'Định dạng URL chưa hợp lệ (Ví dụ: https://chatgpt.com).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalUrl = normalizeUrl(url);

    onSave({
      id: initialData?.id,
      title: title.trim(),
      url: finalUrl,
      description: description.trim(),
      categoryId: categoryId || 'cat-khac',
      tags,
      isPinned,
      isFavorite,
    });

    onClose();
  };

  if (!isOpen) return null;

  const currentFavicon = url && isValidUrl(url) ? getFaviconUrl(url) : null;
  const currentCategory = categories.find((c) => c.id === categoryId);

  return (
    <AnimatePresence>
      <div
        id="link-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          id="link-modal-dialog"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-white/95 dark:bg-[#191428] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-950/80 overflow-hidden my-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-purple-100 dark:border-purple-950/60 bg-purple-50/40 dark:bg-[#191428]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100/70 dark:bg-purple-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                {isEditing ? <Sparkles className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                  {isEditing ? 'Chỉnh sửa liên kết' : 'Thêm liên kết tài nguyên mới'}
                </h3>
                <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
                  {isEditing ? 'Cập nhật thông tin chi tiết của tài nguyên' : 'Lưu trữ liên kết tài liệu dạy học vào kho'}
                </p>
              </div>
            </div>
            <button
              type="button"
              id="link-modal-close-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* URL field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Đường dẫn liên kết (URL) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-800 flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                  >
                    <Clipboard className="w-3 h-3" />
                    Dán nhanh
                  </button>
                  {currentFavicon && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <img
                        src={currentFavicon}
                        alt="favicon preview"
                        className="w-3.5 h-3.5 rounded-sm"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {extractDomain(url)}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="link-input-url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errors.url) setErrors({ ...errors, url: undefined });
                  }}
                  onBlur={handleUrlBlur}
                  placeholder="https://quizizz.com, https://canva.com, https://youtube.com..."
                  className={`w-full px-4 py-3 rounded-xl border bg-purple-50/30 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    errors.url
                      ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                      : 'border-purple-200 dark:border-slate-700'
                  }`}
                  autoFocus
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-blue-600/80 dark:text-blue-400/80">
                <span className="flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-blue-500" /> Tự động nhận diện môn học, tên & từ khóa khi dán URL
                </span>
              </div>
              {errors.url && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.url}
                </p>
              )}
            </div>

            {/* Title field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1.5">
                Tên liên kết <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="link-input-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="VD: Trợ lý soạn giáo án ChatGPT, Sách điện tử..."
                className={`w-full px-4 py-3 rounded-xl border bg-purple-50/30 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                  errors.title
                    ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                    : 'border-purple-200 dark:border-slate-700'
                }`}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1.5">
                Mô tả ngắn gọn
              </label>
              <textarea
                id="link-input-description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ghi chú mục đích dùng, môn học hoặc hoạt động bài dạy..."
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-purple-50/30 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
              />
            </div>

            {/* Category selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Danh mục phân loại
                </label>
                {onOpenCreateCategory && (
                  <button
                    type="button"
                    onClick={onOpenCreateCategory}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Tạo danh mục mới
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-purple-200 dark:border-slate-700 rounded-xl bg-purple-50/30 dark:bg-slate-800/30">
                {categories.map((cat) => {
                  const isSelected = cat.id === categoryId;
                  const catColor = getCategoryColor(cat.color);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      id={`select-cat-${cat.id}`}
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700/60 border border-purple-100 dark:border-slate-700/60'
                      }`}
                    >
                      <CategoryIcon
                        iconName={cat.iconName}
                        className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : catColor.text}`}
                      />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags / Keywords */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Từ khóa tìm kiếm (Gõ phím Enter hoặc dấu phẩy để thêm)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-purple-200 dark:border-slate-700 bg-purple-50/30 dark:bg-slate-800/60">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-blue-900 dark:text-blue-200 text-xs font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDownTag}
                  onBlur={handleAddTag}
                  placeholder={tags.length === 0 ? 'VD: Toán 2, Tiếng Việt, Khởi động...' : '+ Thêm từ khóa...'}
                  className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden py-1 px-1"
                />
              </div>
            </div>

            {/* Flags: Pin and Favorite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                  isPinned
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40'
                    : 'border-purple-200 dark:border-slate-700 bg-purple-50/30 dark:bg-slate-800/40'
                }`}
              >
                <input
                  type="checkbox"
                  id="link-checkbox-pin"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isPinned ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Ghim quan trọng</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Luôn hiển thị trên đầu danh sách</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                  isFavorite
                    ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50/70 dark:bg-yellow-950/40'
                    : 'border-purple-200 dark:border-slate-700 bg-purple-50/30 dark:bg-slate-800/40'
                }`}
              >
                <input
                  type="checkbox"
                  id="link-checkbox-fav"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isFavorite ? 'bg-yellow-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Đánh dấu Yêu thích</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Thêm vào mục tài nguyên hay dùng</div>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100 dark:border-purple-950/60">
              <button
                type="button"
                id="link-modal-btn-cancel"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-purple-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                id="link-modal-btn-submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {isEditing ? 'Lưu thay đổi' : 'Lưu liên kết vào kho'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
