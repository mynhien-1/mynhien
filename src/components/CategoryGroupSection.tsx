import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Plus, FolderOpen } from 'lucide-react';
import { Category, ResourceLink, ViewMode } from '../types';
import { CategoryIcon, getCategoryColor } from './IconHelper';
import { LinkCard } from './LinkCard';
import { LinkListRow } from './LinkListRow';
import { LinkCompactRow } from './LinkCompactRow';

interface CategoryGroupSectionProps {
  category: Category;
  links: ResourceLink[];
  viewMode: ViewMode;
  selectedLinkIds: Set<string>;
  onToggleSelectLink: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (link: ResourceLink) => void;
  onDelete: (link: ResourceLink) => void;
  onShare: (link: ResourceLink) => void;
  onNotify: (msg: string) => void;
  onAddLinkToCategory: (categoryId: string) => void;
  onRecordClick: (id: string) => void;
}

export const CategoryGroupSection: React.FC<CategoryGroupSectionProps> = ({
  category,
  links,
  viewMode,
  selectedLinkIds,
  onToggleSelectLink,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDelete,
  onShare,
  onNotify,
  onAddLinkToCategory,
  onRecordClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const col = getCategoryColor(category.color);

  return (
    <div
      id={`cat-group-${category.id}`}
      className="rounded-3xl bg-purple-50/40 dark:bg-[#191428]/40 border border-purple-100/90 dark:border-purple-950/60 p-4 sm:p-5 transition-all"
    >
      {/* Category Section Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-purple-100 dark:border-purple-950/60">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left group cursor-pointer flex-1 min-w-0"
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${col.badge} group-hover:scale-105 transition-transform`}
          >
            <CategoryIcon iconName={category.iconName} className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-blue-900 dark:text-blue-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {category.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badge}`}
              >
                {links.length}
              </span>
            </div>
            <p className="text-xs text-blue-700/70 dark:text-blue-300/70 truncate hidden sm:block">
              {category.description || `Tài nguyên ${category.name}`}
            </p>
          </div>

          <div className="ml-auto p-1.5 rounded-xl text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-200">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </button>

        {/* Action: + Thêm vào môn này */}
        <button
          type="button"
          onClick={() => onAddLinkToCategory(category.id)}
          title={`Thêm liên kết vào mục ${category.name}`}
          className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Thêm vào mục này</span>
        </button>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-4"
          >
            {links.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-2xl bg-white/40 dark:bg-slate-850/40 border border-dashed border-purple-200 dark:border-slate-800">
                <p className="text-xs text-slate-400">
                  Chưa có liên kết nào trong danh mục <strong>{category.name}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => onAddLinkToCategory(category.id)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm liên kết ngay
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {links.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    category={category}
                    isSelected={selectedLinkIds.has(link.id)}
                    onToggleSelect={onToggleSelectLink}
                    onToggleFavorite={onToggleFavorite}
                    onTogglePin={onTogglePin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onShare={onShare}
                    onNotify={onNotify}
                    onRecordClick={onRecordClick}
                  />
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-2">
                {links.map((link) => (
                  <LinkListRow
                    key={link.id}
                    link={link}
                    category={category}
                    isSelected={selectedLinkIds.has(link.id)}
                    onToggleSelect={onToggleSelectLink}
                    onToggleFavorite={onToggleFavorite}
                    onTogglePin={onTogglePin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onShare={onShare}
                    onNotify={onNotify}
                    onRecordClick={onRecordClick}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {links.map((link) => (
                  <LinkCompactRow
                    key={link.id}
                    link={link}
                    category={category}
                    isSelected={selectedLinkIds.has(link.id)}
                    onToggleSelect={onToggleSelectLink}
                    onToggleFavorite={onToggleFavorite}
                    onTogglePin={onTogglePin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onShare={onShare}
                    onNotify={onNotify}
                    onRecordClick={onRecordClick}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
