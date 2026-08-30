import React from 'react';
import {
  Home,
  Layers,
  Star,
  Pin,
  Trash2,
  Settings,
  Plus,
  HelpCircle,
  Sparkles,
  GraduationCap,
  Folder,
  X,
  LogIn,
  LogOut,
  UserCheck,
  Globe,
  Database,
} from 'lucide-react';
import { ActiveTab, Category, ResourceLink, UserProfile } from '../types';
import { CategoryIcon, getCategoryColor } from './IconHelper';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  categories: Category[];
  links: ResourceLink[];
  onOpenCreateLink: () => void;
  onOpenCreateCategory: () => void;
  onOpenDeployGuide: () => void;
  onOpenDatabaseStatus?: () => void;
  user: UserProfile | null;
  onLoginGoogle: () => void;
  onLogout: () => void;
  isFirebaseAvailable: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  activeTab,
  onTabChange,
  selectedCategory,
  onSelectCategory,
  categories,
  links,
  onOpenCreateLink,
  onOpenCreateCategory,
  onOpenDeployGuide,
  onOpenDatabaseStatus,
  user,
  onLoginGoogle,
  onLogout,
  isFirebaseAvailable,
}) => {
  const activeLinks = links.filter((l) => !l.isTrash);
  const favoriteCount = activeLinks.filter((l) => l.isFavorite).length;
  const pinnedCount = activeLinks.filter((l) => l.isPinned).length;
  const trashCount = links.filter((l) => l.isTrash).length;

  const handleNavClick = (tab: ActiveTab, catId: string | null = null) => {
    onTabChange(tab);
    onSelectCategory(catId);
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 bg-white/95 dark:bg-[#191428] border-r border-purple-100/90 dark:border-purple-950/60 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand header */}
        <div className="p-5 border-b border-purple-100/80 dark:border-purple-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400">
                TÀI NGUYÊN KHỐI HAI
              </span>
              <h1 className="text-sm font-extrabold text-blue-700 dark:text-blue-300 leading-tight">
                Kho Liên Kết Thông Minh
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button: + Thêm liên kết */}
        <div className="px-4 pt-4">
          <button
            type="button"
            id="sidebar-btn-add-link"
            onClick={() => {
              onOpenCreateLink();
              if (window.innerWidth < 1024) onCloseMobile();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            ＋ THÊM LIÊN KẾT
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs font-semibold">
          {/* Main sections */}
          <div className="space-y-1">
            <button
              type="button"
              id="nav-btn-home"
              onClick={() => handleNavClick('home', null)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'home' && selectedCategory === null
                  ? 'bg-purple-100/80 dark:bg-purple-950/60 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Trang chủ</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-100/60 dark:bg-purple-950 text-[10px] text-blue-700 dark:text-blue-300 font-bold">
                {activeLinks.length}
              </span>
            </button>

            <button
              type="button"
              id="nav-btn-all"
              onClick={() => handleNavClick('all', null)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'all' && selectedCategory === null
                  ? 'bg-purple-100/80 dark:bg-purple-950/60 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-sky-500" />
                <span>Tất cả liên kết</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-100/60 dark:bg-purple-950 text-[10px] text-blue-700 dark:text-blue-300 font-bold">
                {activeLinks.length}
              </span>
            </button>

            <button
              type="button"
              id="nav-btn-favorites"
              onClick={() => handleNavClick('favorites', null)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 hover:text-amber-700 dark:hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Liên kết yêu thích</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                {favoriteCount}
              </span>
            </button>

            <button
              type="button"
              id="nav-btn-pinned"
              onClick={() => handleNavClick('pinned', null)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pinned'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 hover:text-amber-700 dark:hover:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Pin className="w-4 h-4 text-amber-500" />
                <span>Đã ghim quan trọng</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                {pinnedCount}
              </span>
            </button>
          </div>

          {/* Categories Section */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <span>Các danh mục ({categories.length})</span>
              <button
                type="button"
                onClick={() => {
                  onOpenCreateCategory();
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-1 cursor-pointer"
                title="Quản lý / Thêm danh mục"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = activeLinks.filter((l) => l.categoryId === cat.id).length;
                const isSelected = activeTab === 'categories' && selectedCategory === cat.id;
                const col = getCategoryColor(cat.color);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`sidebar-cat-${cat.id}`}
                    onClick={() => handleNavClick('categories', cat.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 hover:text-blue-700 dark:hover:text-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryIcon
                        iconName={cat.iconName}
                        className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : col.text}`}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System & Tools Section */}
          <div className="space-y-1 pt-2 border-t border-purple-100/80 dark:border-purple-950/60">
            <div className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Hệ thống
            </div>
            <button
              type="button"
              id="nav-btn-trash"
              onClick={() => handleNavClick('trash', null)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'trash'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Thùng rác</span>
              </div>
              {trashCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                  {trashCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="nav-btn-database"
              onClick={() => {
                if (onOpenDatabaseStatus) onOpenDatabaseStatus();
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cơ sở dữ liệu (Firebase)</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            <button
              type="button"
              id="nav-btn-settings"
              onClick={() => handleNavClick('settings', null)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-purple-100/80 dark:bg-purple-950/60 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-blue-500" />
                <span>Cài đặt hệ thống</span>
              </div>
            </button>

            <button
              type="button"
              id="nav-btn-guide"
              onClick={() => {
                onOpenDeployGuide();
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all font-bold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4" />
                <span>Hướng dẫn Vercel & Firebase</span>
              </div>
            </button>
          </div>
        </div>

        {/* User Account / Local Mode Footer */}
        <div className="p-4 border-t border-purple-100/80 dark:border-purple-950/60 bg-purple-50/60 dark:bg-[#181326]/60">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-purple-200 dark:border-purple-800"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {(user.displayName || 'G')[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 truncate">
                    {user.displayName || 'Giáo viên Khối 2'}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đã đồng bộ Cloud
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                title="Đăng xuất"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div>
                  <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                    Chế độ Cục bộ (Local)
                  </div>
                  <div className="text-[10px] text-slate-400">Lưu an toàn trên máy</div>
                </div>
              </div>

              {isFirebaseAvailable && (
                <button
                  type="button"
                  onClick={onLoginGoogle}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  Đăng nhập
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
