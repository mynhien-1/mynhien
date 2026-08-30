import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ExternalLink,
  Copy,
  Share2,
  Edit2,
  Trash2,
  Star,
  Pin,
  Globe,
  Check,
  MousePointerClick,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ResourceLink, Category } from '../types';
import { extractDomain, getFaviconUrl, copyToClipboard } from '../services/storage';
import { CategoryIcon, getCategoryColor } from './IconHelper';

interface LinkListRowProps {
  link: ResourceLink;
  category?: Category;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (link: ResourceLink) => void;
  onDelete: (link: ResourceLink) => void;
  onShare: (link: ResourceLink) => void;
  onNotify: (msg: string) => void;
  onSelectCategory?: (categoryId: string) => void;
  onRecordClick?: (id: string) => void;
}

export const LinkListRow: React.FC<LinkListRowProps> = ({
  link,
  category,
  isSelected = false,
  onToggleSelect,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDelete,
  onShare,
  onNotify,
  onSelectCategory,
  onRecordClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const domain = extractDomain(link.url);
  const faviconUrl = getFaviconUrl(link.url);
  const catColor = getCategoryColor(category?.color);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyToClipboard(link.url);
    if (ok) {
      setCopied(true);
      onNotify('Đã sao chép liên kết vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (onRecordClick) {
      onRecordClick(link.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      id={`link-row-${link.id}`}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-[#191428] border transition-all ${
        isSelected
          ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/30 bg-purple-50/40 dark:bg-purple-950/20'
          : link.isPinned
          ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20'
          : 'border-purple-100/90 dark:border-purple-950/60 hover:border-blue-300 dark:hover:border-blue-800'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Selection Checkbox */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(link.id);
            }}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isSelected
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-300 dark:text-slate-600 hover:text-blue-500'
            }`}
            title={isSelected ? 'Bỏ chọn' : 'Chọn liên kết này'}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 fill-blue-600 text-white dark:fill-blue-500" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Favicon */}
        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {!imageError && faviconUrl ? (
            <img
              src={faviconUrl}
              alt={link.title}
              className="w-4 h-4 object-contain"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <CategoryIcon
              iconName={category?.iconName || 'Globe'}
              className={`w-4 h-4 ${catColor.text}`}
            />
          )}
        </div>

        {/* Title, Category & Description */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors truncate">
              <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={handleOpenLink}>
                {link.title}
              </a>
            </h4>

            {category && (
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(category.id)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${catColor.badge}`}
              >
                <span>{category.name}</span>
              </button>
            )}

            {link.isPinned && (
              <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-0.5">
                <Pin className="w-2.5 h-2.5 fill-amber-600" /> Ghim
              </span>
            )}

            {Boolean(link.clickCount && link.clickCount > 0) && (
              <span className="hidden md:inline-flex items-center gap-0.5 text-blue-500 dark:text-blue-400 text-[10px]" title={`Đã mở ${link.clickCount} lần`}>
                <MousePointerClick className="w-3 h-3" />
                {link.clickCount}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {link.description || domain}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-100/80 dark:border-purple-950/60">
        <button
          type="button"
          onClick={() => onToggleFavorite(link.id)}
          title={link.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            link.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
          }`}
        >
          <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>

        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenLink}
          title="Mở liên kết"
          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/60 dark:hover:bg-blue-600 dark:text-blue-400 dark:hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Mở</span>
        </a>

        <button
          type="button"
          onClick={handleCopy}
          title="Sao chép liên kết"
          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => onShare(link)}
          title="Chia sẻ"
          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onEdit(link)}
          title="Chỉnh sửa"
          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(link)}
          title="Xóa"
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
