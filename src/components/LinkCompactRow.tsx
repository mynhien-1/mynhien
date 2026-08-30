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
  Check,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ResourceLink, Category } from '../types';
import { extractDomain, getFaviconUrl, copyToClipboard } from '../services/storage';
import { CategoryIcon, getCategoryColor } from './IconHelper';

interface LinkCompactRowProps {
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

export const LinkCompactRow: React.FC<LinkCompactRowProps> = ({
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      id={`link-compact-${link.id}`}
      className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/95 dark:bg-[#191428] border transition-all text-xs ${
        isSelected
          ? 'border-blue-500 ring-1 ring-blue-500/30 bg-purple-50/40 dark:bg-purple-950/20'
          : link.isPinned
          ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20'
          : 'border-purple-100/80 dark:border-purple-950/50 hover:border-blue-300 dark:hover:border-blue-800'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(link.id);
            }}
            className={`p-0.5 rounded cursor-pointer ${
              isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600 hover:text-blue-500'
            }`}
          >
            {isSelected ? (
              <CheckSquare className="w-3.5 h-3.5 fill-blue-600 text-white dark:fill-blue-500" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {!imageError && faviconUrl ? (
            <img
              src={faviconUrl}
              alt={link.title}
              className="w-3.5 h-3.5 object-contain"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <CategoryIcon iconName={category?.iconName || 'Globe'} className={`w-3.5 h-3.5 ${catColor.text}`} />
          )}
        </div>

        <div className="min-w-0 flex-1 flex items-center gap-2">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenLink}
            className="font-bold text-blue-700 dark:text-blue-300 hover:underline truncate max-w-[200px] sm:max-w-[320px]"
            title={link.title}
          >
            {link.title}
          </a>

          {category && (
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(category.id)}
              className={`hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold cursor-pointer ${catColor.badge}`}
            >
              {category.name}
            </button>
          )}

          <span className="hidden md:inline text-[10px] text-slate-400 truncate max-w-[150px]">
            {domain}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => onTogglePin(link.id)}
          title={link.isPinned ? 'Bỏ ghim' : 'Ghim'}
          className={`p-1 rounded transition-colors cursor-pointer ${
            link.isPinned ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${link.isPinned ? 'fill-amber-500' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(link.id)}
          title={link.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          className={`p-1 rounded transition-colors cursor-pointer ${
            link.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${link.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>

        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenLink}
          title="Mở liên kết"
          className="px-2 py-0.8 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/60 dark:hover:bg-blue-600 dark:text-blue-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Mở</span>
        </a>

        <button
          type="button"
          onClick={handleCopy}
          title="Sao chép"
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => onShare(link)}
          title="Chia sẻ"
          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onEdit(link)}
          title="Sửa"
          className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(link)}
          title="Xóa"
          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
