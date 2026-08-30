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
  Clock,
  Globe,
  Check,
  MousePointerClick,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ResourceLink, Category } from '../types';
import { extractDomain, getFaviconUrl, copyToClipboard } from '../services/storage';
import { CategoryIcon, getCategoryColor } from './IconHelper';

interface LinkCardProps {
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

export const LinkCard: React.FC<LinkCardProps> = ({
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

  const formattedDate = link.createdAt
    ? new Date(link.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      id={`link-card-${link.id}`}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white/95 dark:bg-[#191428] border transition-all duration-200 shadow-2xs hover:shadow-md ${
        isSelected
          ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/30 bg-purple-50/40 dark:bg-purple-950/20'
          : link.isPinned
          ? 'border-amber-300/80 dark:border-amber-700/60 ring-1 ring-amber-400/30 dark:ring-amber-500/20'
          : 'border-purple-100/90 dark:border-purple-950/60 hover:border-blue-300 dark:hover:border-blue-800'
      }`}
    >
      {/* Pinned Marker Indicator */}
      {link.isPinned && (
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-extrabold tracking-wide uppercase shadow-xs flex items-center gap-1 z-10">
          <Pin className="w-2.5 h-2.5 fill-white" />
          Đã ghim
        </div>
      )}

      {/* Top Header Section */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Selection Checkbox */}
            {onToggleSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(link.id);
                }}
                className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer ${
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

            {/* Favicon / Icon Box */}
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
              {!imageError && faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt={link.title}
                  className="w-5 h-5 object-contain"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <CategoryIcon
                  iconName={category?.iconName || 'Globe'}
                  className={`w-5 h-5 ${catColor.text}`}
                />
              )}
            </div>

            {/* Title and Domain */}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors line-clamp-1 leading-snug">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOpenLink}
                  className="hover:underline"
                  title={link.title}
                >
                  {link.title}
                </a>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <Globe className="w-3 h-3 flex-shrink-0" />
                {domain}
              </p>
            </div>
          </div>

          {/* Quick Favorite & Pin toggle buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              id={`btn-pin-${link.id}`}
              onClick={() => onTogglePin(link.id)}
              title={link.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                link.isPinned
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Pin className={`w-4 h-4 ${link.isPinned ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              type="button"
              id={`btn-fav-${link.id}`}
              onClick={() => onToggleFavorite(link.id)}
              title={link.isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                link.isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Description */}
        {link.description ? (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {link.description}
          </p>
        ) : (
          <p className="mt-3 text-xs text-slate-400 italic">Chưa có mô tả cho liên kết này.</p>
        )}

        {/* Category Badge & Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {category && (
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(category.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border transition-transform hover:scale-105 cursor-pointer ${catColor.badge} ${catColor.border}`}
            >
              <CategoryIcon iconName={category.iconName} className="w-3 h-3" />
              <span>{category.name}</span>
            </button>
          )}

          {link.tags &&
            link.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-[10px] font-medium border border-purple-100 dark:border-slate-700"
              >
                #{tag}
              </span>
            ))}
        </div>
      </div>

      {/* Footer Section with Action Buttons & Timestamp */}
      <div className="mt-4 pt-3 border-t border-purple-100/80 dark:border-purple-950/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </span>
          {Boolean(link.clickCount && link.clickCount > 0) && (
            <span className="hidden sm:flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold text-[10px]" title={`Đã mở ${link.clickCount} lần`}>
              <MousePointerClick className="w-3 h-3" />
              {link.clickCount}
            </span>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-1">
          {/* Open Link */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenLink}
            id={`btn-open-${link.id}`}
            title="Mở trong tab mới"
            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/60 dark:hover:bg-blue-600 dark:text-blue-400 dark:hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở</span>
          </a>

          {/* Copy URL */}
          <button
            type="button"
            id={`btn-copy-${link.id}`}
            onClick={handleCopy}
            title="Sao chép liên kết"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Share */}
          <button
            type="button"
            id={`btn-share-${link.id}`}
            onClick={() => onShare(link)}
            title="Chia sẻ liên kết"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Edit */}
          <button
            type="button"
            id={`btn-edit-${link.id}`}
            onClick={() => onEdit(link)}
            title="Chỉnh sửa thông tin"
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete (Move to trash) */}
          <button
            type="button"
            id={`btn-delete-${link.id}`}
            onClick={() => onDelete(link)}
            title="Chuyển vào thùng rác"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

