import React from 'react';
import { motion } from 'motion/react';
import { Layers, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { Category, ResourceLink } from '../types';
import { CategoryIcon, getCategoryColor } from './IconHelper';

interface CategoriesViewProps {
  categories: Category[];
  links: ResourceLink[];
  onSelectCategory: (catId: string) => void;
  onOpenCategoryManager: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  links,
  onSelectCategory,
  onOpenCategoryManager,
}) => {
  const activeLinks = links.filter((l) => !l.isTrash);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/95 dark:bg-[#191428] border border-purple-100 dark:border-purple-950/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100/70 dark:bg-purple-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-blue-900 dark:text-blue-200">
              Danh mục tài nguyên ({categories.length} nhóm)
            </h2>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
              Phân loại bài giảng, giáo án, video, công cụ AI và trò chơi lớp 2
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-categories-view-manage"
          onClick={onOpenCategoryManager}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Quản lý & Thêm danh mục
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const catLinks = activeLinks.filter((l) => l.categoryId === cat.id);
          const col = getCategoryColor(cat.color);

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -3 }}
              id={`category-card-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md ${col.bg} ${col.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${col.badge} shadow-xs`}>
                    <CategoryIcon iconName={cat.iconName} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {catLinks.length} liên kết tài nguyên
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample link snippets */}
              <div className="space-y-1 pt-2 border-t border-black/5 dark:border-white/5">
                {catLinks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có liên kết trong mục này</p>
                ) : (
                  catLinks.slice(0, 2).map((l) => (
                    <p key={l.id} className="text-xs text-slate-600 dark:text-slate-400 truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {l.title}
                    </p>
                  ))
                )}
                {catLinks.length > 2 && (
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    +{catLinks.length - 2} liên kết khác
                  </p>
                )}
              </div>

              <div className="pt-1 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Xem danh sách</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
