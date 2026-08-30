import React from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  AlignJustify,
  Share2,
  Menu,
  X,
  ArrowUpDown,
  Layers,
  CheckSquare,
  Sparkles,
  Database,
} from 'lucide-react';
import { ViewMode, SortOption, Category } from '../types';
import { CategoryIcon } from './IconHelper';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isGroupedByCategory: boolean;
  onToggleGroupByCategory: () => void;
  isMultiSelectMode: boolean;
  onToggleMultiSelectMode: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenCreateLink: () => void;
  onOpenShareAll: () => void;
  onOpenDatabaseStatus?: () => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  filterOnlyFavorite: boolean;
  onToggleFilterFavorite: () => void;
  filterOnlyPinned: boolean;
  onToggleFilterPinned: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isGroupedByCategory,
  onToggleGroupByCategory,
  isMultiSelectMode,
  onToggleMultiSelectMode,
  sortOption,
  onSortChange,
  onOpenCreateLink,
  onOpenShareAll,
  onOpenDatabaseStatus,
  categories,
  selectedCategory,
  onSelectCategory,
  filterOnlyFavorite,
  onToggleFilterFavorite,
  filterOnlyPinned,
  onToggleFilterPinned,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#191428]/95 backdrop-blur-md border-b border-purple-100/90 dark:border-purple-950/60 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
        {/* Top row: Hamburger, Search bar, and Primary action buttons */}
        <div className="flex items-center justify-between gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            id="btn-mobile-menu-toggle"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-700 dark:text-slate-200 shadow-2xs cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Large Search Input */}
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="main-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm liên kết theo tên, URL, mô tả, từ khóa #toán, #canva..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-purple-200/80 dark:border-purple-950/60 bg-[#f9f7ff] dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Database Cloud Sync Status button */}
            {onOpenDatabaseStatus && (
              <button
                type="button"
                id="btn-database-status"
                onClick={onOpenDatabaseStatus}
                title="Trạng thái Cơ sở dữ liệu & Đồng bộ Đám mây (Firebase)"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Database</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>
            )}

            {/* Share all vault button */}
            <button
              type="button"
              id="btn-share-all-vault"
              onClick={onOpenShareAll}
              title="Chia sẻ kho liên kết"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-100/60 dark:bg-purple-950/40 text-blue-700 dark:text-blue-300 hover:bg-purple-200/70 dark:hover:bg-purple-900/60 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ kho</span>
            </button>

            {/* + Thêm liên kết highlight button */}
            <button
              type="button"
              id="btn-navbar-add-link"
              onClick={onOpenCreateLink}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-black shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">＋ THÊM LIÊN KẾT</span>
              <span className="sm:hidden">Thêm mới</span>
            </button>
          </div>
        </div>

        {/* Middle row: Category Tabs Scrollbar (Subject Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            id="filter-chip-all"
            onClick={() => {
              onSelectCategory(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-purple-100/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-200/70 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả môn học
          </button>

          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                id={`filter-chip-cat-${c.id}`}
                onClick={() => onSelectCategory(isSelected ? null : c.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-purple-100/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-200/70 dark:hover:bg-slate-700'
                }`}
              >
                <CategoryIcon iconName={c.iconName} className="w-3.5 h-3.5" />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom row: Filter Chips, Group Mode, Multi-select, Sort & View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-purple-100/80 dark:border-slate-800/80 text-xs">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              id="filter-chip-fav"
              onClick={onToggleFilterFavorite}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                filterOnlyFavorite
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-purple-100/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-200/70 dark:hover:bg-slate-700'
              }`}
            >
              ★ Yêu thích
            </button>

            <button
              type="button"
              id="filter-chip-pinned"
              onClick={onToggleFilterPinned}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                filterOnlyPinned
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-purple-100/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-200/70 dark:hover:bg-slate-700'
              }`}
            >
              📌 Đã ghim
            </button>

            {/* Multi-select toggle */}
            <button
              type="button"
              id="btn-toggle-multi-select"
              onClick={onToggleMultiSelectMode}
              title="Bật/Tắt chế độ chọn nhiều liên kết để thao tác hàng loạt"
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isMultiSelectMode
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-purple-100/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-200/70 dark:hover:bg-slate-700'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isMultiSelectMode ? 'Đang chọn nhiều' : 'Chọn nhiều'}</span>
            </button>
          </div>

          {/* Group mode toggle, Sort & Grid/List view toggle */}
          <div className="flex items-center gap-2">
            {/* Group by category toggle */}
            <button
              type="button"
              id="btn-toggle-group-mode"
              onClick={onToggleGroupByCategory}
              title={isGroupedByCategory ? 'Chuyển sang danh sách phẳng' : 'Gom nhóm theo từng môn học'}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                isGroupedByCategory
                  ? 'bg-purple-100/90 dark:bg-purple-950/60 text-blue-700 dark:text-blue-300 border-purple-200 dark:border-purple-800'
                  : 'bg-purple-100/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-purple-200/70 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gom theo môn học</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 bg-purple-100/60 dark:bg-slate-800 rounded-xl p-1 border border-purple-200/60 dark:border-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-500 ml-1.5" />
              <select
                id="select-sort-order"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Sắp xếp danh sách"
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 py-0.5 pr-2 focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="az">Tên A → Z</option>
                <option value="za">Tên Z → A</option>
                <option value="popular">Hay dùng nhất</option>
              </select>
            </div>

            {/* Grid / List / Compact View Toggle */}
            <div className="flex items-center bg-purple-100/60 dark:bg-slate-800 p-0.5 rounded-xl border border-purple-200/60 dark:border-slate-700">
              <button
                type="button"
                id="btn-view-mode-grid"
                onClick={() => onViewModeChange('grid')}
                title="Dạng lưới (Grid)"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="btn-view-mode-list"
                onClick={() => onViewModeChange('list')}
                title="Dạng danh sách (List)"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="btn-view-mode-compact"
                onClick={() => onViewModeChange('compact')}
                title="Dạng bảng thu gọn (Compact)"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
