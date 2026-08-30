import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Share2,
  Sparkles,
  Layers,
  Star,
  Pin,
  ExternalLink,
  BookOpen,
  FolderSearch,
  FilterX,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  ResourceLink,
  Category,
  ViewMode,
  SortOption,
  ActiveTab,
  UserProfile,
  ToastMessage,
  ThemeOption,
} from './types';
import { StorageService, isValidUrl, normalizeUrl } from './services/storage';
import {
  isFirebaseConfigured,
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  syncUserDataToFirestore,
  fetchUserDataFromFirestore,
  syncSharedDataToFirestore,
  fetchSharedDataFromFirestore,
  subscribeToSharedFirestore,
} from './services/firebase';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { QuickAddBar } from './components/QuickAddBar';
import { BatchActionBar } from './components/BatchActionBar';
import { CategoryGroupSection } from './components/CategoryGroupSection';
import { LinkCard } from './components/LinkCard';
import { LinkListRow } from './components/LinkListRow';
import { LinkCompactRow } from './components/LinkCompactRow';
import { LinkModal } from './components/LinkModal';
import { ShareLinkModal } from './components/ShareLinkModal';
import { ShareAllModal } from './components/ShareAllModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { TrashView } from './components/TrashView';
import { CategoriesView } from './components/CategoriesView';
import { SettingsView } from './components/SettingsView';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { ToastContainer } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { copyToClipboard } from './services/storage';

export default function App() {
  // --- State Initialization ---
  const [links, setLinks] = useState<ResourceLink[]>(() => StorageService.getLinks());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [theme, setTheme] = useState<ThemeOption>(() => StorageService.getTheme());
  const [user, setUser] = useState<UserProfile | null>(null);

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('tai_nguyen_view_mode');
    return (saved === 'list' || saved === 'compact' || saved === 'grid') ? saved : 'grid';
  });
  const [isGroupedByCategory, setIsGroupedByCategory] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOnlyFavorite, setFilterOnlyFavorite] = useState(false);
  const [filterOnlyPinned, setFilterOnlyPinned] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Persist viewMode
  useEffect(() => {
    try {
      localStorage.setItem('tai_nguyen_view_mode', viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

  // Global Keyboard Shortcuts (Ctrl/Cmd + K to search, Ctrl/Cmd + N to add link)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingLink(null);
        setLinkModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modals
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ResourceLink | null>(null);

  const [shareLinkModalOpen, setShareLinkModalOpen] = useState(false);
  const [sharingLink, setSharingLink] = useState<ResourceLink | null>(null);

  const [shareAllModalOpen, setShareAllModalOpen] = useState(false);
  const [categoryManagerModalOpen, setCategoryManagerModalOpen] = useState(false);
  const [deployGuideModalOpen, setDeployGuideModalOpen] = useState(false);
  const [databaseStatusModalOpen, setDatabaseStatusModalOpen] = useState(false);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
      setToasts((prev) => [...prev, { id, message, type, title }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme application
  useEffect(() => {
    StorageService.saveTheme(theme);
  }, [theme]);

  // Initial fetch and Realtime sync from shared Firestore Database
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let isMounted = true;
    // Initial fetch from Firestore shared vault
    fetchSharedDataFromFirestore().then((cloudData) => {
      if (!isMounted || !cloudData) return;
      if (Array.isArray(cloudData.links) && cloudData.links.length > 0) {
        setLinks(cloudData.links);
        StorageService.saveLinks(cloudData.links);
      }
      if (Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
        setCategories(cloudData.categories);
        StorageService.saveCategories(cloudData.categories);
      }
    });

    // Real-time updates subscription from Firestore
    const unsubShared = subscribeToSharedFirestore((cloudData) => {
      if (!isMounted) return;
      if (Array.isArray(cloudData.links)) {
        setLinks(cloudData.links);
        StorageService.saveLinks(cloudData.links);
      }
      if (Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
        setCategories(cloudData.categories);
        StorageService.saveCategories(cloudData.categories);
      }
    });

    return () => {
      isMounted = false;
      unsubShared();
    };
  }, []);

  // Save links to localStorage and sync directly to Firestore database
  useEffect(() => {
    StorageService.saveLinks(links);
    if (isFirebaseConfigured) {
      syncSharedDataToFirestore({ links, categories });
      if (user) {
        syncUserDataToFirestore(user.uid, { links, categories });
      }
    }
  }, [links, categories, user]);

  // Auth Listener
  useEffect(() => {
    const unsub = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load user data from Firestore if available
        const cloudData = await fetchUserDataFromFirestore(currentUser.uid);
        if (cloudData && Array.isArray(cloudData.links)) {
          setLinks(cloudData.links);
          if (Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
            setCategories(cloudData.categories);
          }
          addToast(`Chào mừng thầy/cô ${currentUser.displayName || ''}! Đã đồng bộ tài nguyên đám mây.`, 'success');
        }
      }
    });
    return () => unsub();
  }, [addToast]);

  // Google Login / Logout handlers
  const handleGoogleLogin = async () => {
    try {
      const loggedInUser = await loginWithGoogle();
      if (loggedInUser) {
        addToast(`Đăng nhập Google thành công!`, 'success');
      }
    } catch (err: any) {
      addToast(err?.message || 'Không thể đăng nhập Google', 'error');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    addToast('Đã đăng xuất tài khoản Google.', 'info');
  };

  // --- Click Counter Recording ---
  const handleRecordClick = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, clickCount: (l.clickCount || 0) + 1 } : l))
    );
  };

  // --- Multi-Select & Batch Actions ---
  const handleToggleSelectLink = (id: string) => {
    setSelectedLinkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(sortedLinks.map((l) => l.id));
    setSelectedLinkIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedLinkIds(new Set());
  };

  const handleBatchFavorite = (fav: boolean) => {
    setLinks((prev) =>
      prev.map((l) => (selectedLinkIds.has(l.id) ? { ...l, isFavorite: fav } : l))
    );
    addToast(`Đã cập nhật yêu thích cho ${selectedLinkIds.size} liên kết!`, 'success');
  };

  const handleBatchPin = (pin: boolean) => {
    setLinks((prev) =>
      prev.map((l) => (selectedLinkIds.has(l.id) ? { ...l, isPinned: pin } : l))
    );
    addToast(`Đã cập nhật ghim cho ${selectedLinkIds.size} liên kết!`, 'success');
  };

  const handleBatchChangeCategory = (targetCatId: string) => {
    setLinks((prev) =>
      prev.map((l) => (selectedLinkIds.has(l.id) ? { ...l, categoryId: targetCatId } : l))
    );
    const catName = categories.find((c) => c.id === targetCatId)?.name || 'mục mới';
    addToast(`Đã chuyển ${selectedLinkIds.size} liên kết sang mục "${catName}"!`, 'success');
  };

  const handleBatchDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa hàng loạt liên kết',
      message: `Bạn có chắc muốn chuyển ${selectedLinkIds.size} liên kết đã chọn vào Thùng rác không?`,
      confirmLabel: 'Xóa đã chọn',
      isDestructive: true,
      onConfirm: () => {
        setLinks((prev) =>
          prev.map((l) =>
            selectedLinkIds.has(l.id)
              ? { ...l, isTrash: true, deletedAt: new Date().toISOString() }
              : l
          )
        );
        addToast(`Đã chuyển ${selectedLinkIds.size} liên kết vào thùng rác.`, 'info');
        setSelectedLinkIds(new Set());
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  const handleBatchCopyUrls = async () => {
    const selectedUrls = links
      .filter((l) => selectedLinkIds.has(l.id))
      .map((l) => `${l.title}: ${l.url}`)
      .join('\n');

    const ok = await copyToClipboard(selectedUrls);
    if (ok) {
      addToast(`Đã sao chép ${selectedLinkIds.size} đường dẫn vào bộ nhớ tạm!`, 'success');
    }
  };

  // --- CRUD Handlers ---

  const handleOpenCreateLink = (initialUrl?: string, defaultCatId?: string) => {
    if (initialUrl || defaultCatId) {
      setEditingLink({
        id: '',
        title: '',
        url: initialUrl || '',
        description: '',
        categoryId: defaultCatId || categories[0]?.id || 'cat-khac',
        tags: [],
        isFavorite: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      setEditingLink(null);
    }
    setLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: ResourceLink) => {
    setEditingLink(link);
    setLinkModalOpen(true);
  };

  const handleSaveLink = (linkData: Partial<ResourceLink>) => {
    if (linkData.id) {
      // Edit existing
      setLinks((prev) =>
        prev.map((l) =>
          l.id === linkData.id
            ? ({
                ...l,
                ...linkData,
                updatedAt: new Date().toISOString(),
              } as ResourceLink)
            : l
        )
      );
      addToast(`Đã cập nhật thông tin liên kết "${linkData.title}"!`, 'success', 'Thành công');
    } else {
      // Create new
      const newLink: ResourceLink = {
        id: 'link-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
        title: linkData.title || 'Liên kết mới',
        url: linkData.url || '',
        description: linkData.description || '',
        categoryId: linkData.categoryId || categories[0]?.id || 'cat-khac',
        tags: linkData.tags || [],
        isPinned: Boolean(linkData.isPinned),
        isFavorite: Boolean(linkData.isFavorite),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clickCount: 0,
      };

      setLinks((prev) => [newLink, ...prev]);

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.85 },
        });
      } catch {
        // ignore if not loaded
      }

      addToast(`Đã thêm liên kết "${newLink.title}" vào kho!`, 'success', 'Đã thêm');
    }
  };

  // Delete -> Move to Trash
  const handleDeleteLink = (link: ResourceLink) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa liên kết',
      message: `Bạn có chắc muốn xóa liên kết "${link.title}" không? Liên kết sẽ được đưa vào Thùng rác và bạn có thể khôi phục bất kỳ lúc nào.`,
      confirmLabel: 'Xóa liên kết',
      isDestructive: true,
      onConfirm: () => {
        setLinks((prev) =>
          prev.map((l) =>
            l.id === link.id
              ? { ...l, isTrash: true, deletedAt: new Date().toISOString() }
              : l
          )
        );
        addToast(`Đã chuyển liên kết "${link.title}" vào Thùng rác.`, 'info');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  // Restore from Trash
  const handleRestoreLink = (link: ResourceLink) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, isTrash: false, deletedAt: null } : l))
    );
    addToast(`Đã khôi phục liên kết "${link.title}" vào kho!`, 'success');
  };

  const handleRestoreAllTrash = () => {
    setLinks((prev) =>
      prev.map((l) => (l.isTrash ? { ...l, isTrash: false, deletedAt: null } : l))
    );
    addToast('Đã khôi phục toàn bộ liên kết trong thùng rác!', 'success');
  };

  // Permanent Delete
  const handlePermanentDelete = (link: ResourceLink) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa vĩnh viễn liên kết',
      message: `Hành động này sẽ xóa hoàn toàn "${link.title}" và không thể khôi phục lại. Bạn có chắc chắn không?`,
      confirmLabel: 'Xóa vĩnh viễn',
      isDestructive: true,
      onConfirm: () => {
        setLinks((prev) => prev.filter((l) => l.id !== link.id));
        addToast(`Đã xóa vĩnh viễn "${link.title}".`, 'info');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  const handleEmptyTrash = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Dọn sạch thùng rác',
      message: 'Bạn có chắc muốn xóa vĩnh viễn tất cả các liên kết trong thùng rác không?',
      confirmLabel: 'Xóa sạch tất cả',
      isDestructive: true,
      onConfirm: () => {
        setLinks((prev) => prev.filter((l) => !l.isTrash));
        addToast('Đã dọn sạch thùng rác.', 'success');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  const handleToggleFavorite = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const nextFav = !l.isFavorite;
          addToast(
            nextFav ? `Đã thêm "${l.title}" vào mục yêu thích!` : `Đã bỏ yêu thích "${l.title}".`,
            'info'
          );
          return { ...l, isFavorite: nextFav };
        }
        return l;
      })
    );
  };

  const handleTogglePin = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const nextPin = !l.isPinned;
          addToast(
            nextPin ? `Đã ghim "${l.title}" lên đầu kho!` : `Đã bỏ ghim "${l.title}".`,
            'info'
          );
          return { ...l, isPinned: nextPin };
        }
        return l;
      })
    );
  };

  // Category CRUD
  const handleSaveCategory = (category: Category) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === category.id);
      if (exists) {
        return prev.map((c) => (c.id === category.id ? category : c));
      }
      return [...prev, category];
    });
  };

  const handleDeleteCategory = (categoryId: string, replacementCatId: string) => {
    // Migrate links to replacement category
    setLinks((prev) =>
      prev.map((l) => (l.categoryId === categoryId ? { ...l, categoryId: replacementCatId } : l))
    );
    // Delete category
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const handleResetAllData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa toàn bộ liên kết (Đặt lại kho trống)',
      message: 'Hành động này sẽ xóa toàn bộ liên kết đã lưu trong kho và đưa về trạng thái kho trống ban đầu để bạn bắt đầu thêm mới theo ý muốn. Bạn có chắc chắn muốn thực hiện?',
      confirmLabel: 'Xác nhận đặt lại',
      isDestructive: true,
      onConfirm: () => {
        StorageService.resetAllData();
        setLinks(StorageService.getLinks());
        setCategories(StorageService.getCategories());
        addToast('Đã đặt lại kho dữ liệu trống thành công!', 'success');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  // Share handlers
  const handleOpenShareLink = (link: ResourceLink) => {
    setSharingLink(link);
    setShareLinkModalOpen(true);
  };

  // --- Filtering & Sorting Compute ---
  const activeLinks = useMemo(() => links.filter((l) => !l.isTrash), [links]);
  const trashLinks = useMemo(() => links.filter((l) => l.isTrash), [links]);

  const filteredLinks = useMemo(() => {
    return activeLinks.filter((link) => {
      // Tab based filter
      if (activeTab === 'favorites' && !link.isFavorite) return false;
      if (activeTab === 'pinned' && !link.isPinned) return false;
      if (activeTab === 'categories' && selectedCategory && link.categoryId !== selectedCategory) {
        return false;
      }

      // Navbar chip filters
      if (selectedCategory && link.categoryId !== selectedCategory) return false;
      if (filterOnlyFavorite && !link.isFavorite) return false;
      if (filterOnlyPinned && !link.isPinned) return false;

      // Search Query filter (matches title, url, description, tags, category name)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const cat = categories.find((c) => c.id === link.categoryId);
        const catName = cat ? cat.name.toLowerCase() : '';
        const inTitle = link.title.toLowerCase().includes(query);
        const inUrl = link.url.toLowerCase().includes(query);
        const inDesc = link.description.toLowerCase().includes(query);
        const inCat = catName.includes(query);
        const inTags = link.tags && link.tags.some((t) => t.toLowerCase().includes(query));

        if (!inTitle && !inUrl && !inDesc && !inCat && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [
    activeLinks,
    activeTab,
    selectedCategory,
    filterOnlyFavorite,
    filterOnlyPinned,
    searchQuery,
    categories,
  ]);

  // Sorted links (Pinned items float on top for regular view)
  const sortedLinks = useMemo(() => {
    const list = [...filteredLinks];

    list.sort((a, b) => {
      // Pinned items stay on top unless sorting specifically overrides
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      if (sortOption === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === 'az') {
        return a.title.localeCompare(b.title, 'vi');
      }
      if (sortOption === 'za') {
        return b.title.localeCompare(a.title, 'vi');
      }
      if (sortOption === 'popular') {
        return (b.clickCount || 0) - (a.clickCount || 0);
      }
      return 0;
    });

    return list;
  }, [filteredLinks, sortOption]);

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#f6f2fe] dark:bg-[#181326] text-slate-800 dark:text-slate-200 transition-colors">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Floating Multi-Select Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedLinkIds.size}
        totalCount={sortedLinks.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBatchFavorite={handleBatchFavorite}
        onBatchPin={handleBatchPin}
        onBatchChangeCategory={handleBatchChangeCategory}
        onBatchDelete={handleBatchDelete}
        onBatchCopyUrls={handleBatchCopyUrls}
        categories={categories}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((c) => ({ ...c, isOpen: false }))}
      />

      {/* Add / Edit Link Modal */}
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSave={handleSaveLink}
        categories={categories}
        initialData={editingLink}
        onOpenCreateCategory={() => {
          setLinkModalOpen(false);
          setCategoryManagerModalOpen(true);
        }}
      />

      {/* Single Link Share Modal */}
      <ShareLinkModal
        isOpen={shareLinkModalOpen}
        onClose={() => setShareLinkModalOpen(false)}
        link={sharingLink}
        category={categories.find((c) => c.id === sharingLink?.categoryId)}
        onNotify={(msg) => addToast(msg, 'success')}
      />

      {/* Share Entire Vault Modal */}
      <ShareAllModal
        isOpen={shareAllModalOpen}
        onClose={() => setShareAllModalOpen(false)}
        links={links}
        categories={categories}
        onNotify={(msg) => addToast(msg, 'success')}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={categoryManagerModalOpen}
        onClose={() => setCategoryManagerModalOpen(false)}
        categories={categories}
        links={links}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onNotify={(msg) => addToast(msg, 'success')}
      />

      {/* Deployment & Firebase Setup Guide Modal */}
      <DeploymentGuideModal
        isOpen={deployGuideModalOpen}
        onClose={() => setDeployGuideModalOpen(false)}
        onNotify={(msg) => addToast(msg, 'success')}
      />

      {/* Database Status & Cloud Sync Modal */}
      <DatabaseStatusModal
        isOpen={databaseStatusModalOpen}
        onClose={() => setDatabaseStatusModalOpen(false)}
        links={links}
        categories={categories}
        onUpdateLinksAndCategories={(newLinks, newCats) => {
          setLinks(newLinks);
          setCategories(newCats);
          StorageService.saveLinks(newLinks);
          StorageService.saveCategories(newCats);
        }}
        onNotify={(msg, type) => addToast(msg, type || 'success')}
      />

      {/* Sidebar navigation */}
      <Sidebar
        isOpen={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'categories') setSelectedCategory(null);
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        links={links}
        onOpenCreateLink={handleOpenCreateLink}
        onOpenCreateCategory={() => setCategoryManagerModalOpen(true)}
        onOpenDeployGuide={() => setDeployGuideModalOpen(true)}
        onOpenDatabaseStatus={() => setDatabaseStatusModalOpen(true)}
        user={user}
        onLoginGoogle={handleGoogleLogin}
        onLogout={handleLogout}
        isFirebaseAvailable={isFirebaseConfigured}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Navbar */}
        <Navbar
          onOpenMobileMenu={() => setSidebarOpenMobile(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isGroupedByCategory={isGroupedByCategory}
          onToggleGroupByCategory={() => setIsGroupedByCategory((prev) => !prev)}
          isMultiSelectMode={isMultiSelectMode}
          onToggleMultiSelectMode={() => setIsMultiSelectMode((prev) => !prev)}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onOpenCreateLink={() => handleOpenCreateLink()}
          onOpenShareAll={() => setShareAllModalOpen(true)}
          onOpenDatabaseStatus={() => setDatabaseStatusModalOpen(true)}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          filterOnlyFavorite={filterOnlyFavorite}
          onToggleFilterFavorite={() => setFilterOnlyFavorite((prev) => !prev)}
          filterOnlyPinned={filterOnlyPinned}
          onToggleFilterPinned={() => setFilterOnlyPinned((prev) => !prev)}
        />

        {/* Page Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* 1. TRASH VIEW */}
          {activeTab === 'trash' && (
            <TrashView
              trashLinks={trashLinks}
              categories={categories}
              onRestore={handleRestoreLink}
              onRestoreAll={handleRestoreAllTrash}
              onPermanentDelete={handlePermanentDelete}
              onEmptyTrash={handleEmptyTrash}
            />
          )}

          {/* 2. CATEGORIES OVERVIEW */}
          {activeTab === 'categories' && !selectedCategory && (
            <CategoriesView
              categories={categories}
              links={links}
              onSelectCategory={(catId) => setSelectedCategory(catId)}
              onOpenCategoryManager={() => setCategoryManagerModalOpen(true)}
            />
          )}

          {/* 3. SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <SettingsView
              theme={theme}
              onThemeChange={setTheme}
              categories={categories}
              links={links}
              onOpenCategoryManager={() => setCategoryManagerModalOpen(true)}
              onOpenDeployGuide={() => setDeployGuideModalOpen(true)}
              onRefreshData={() => {
                setLinks(StorageService.getLinks());
                setCategories(StorageService.getCategories());
              }}
              onNotify={(msg) => addToast(msg, 'success')}
              onRequestResetAll={handleResetAllData}
            />
          )}

          {/* 4. MAIN VAULT VIEW (Home / All / Favorites / Pinned / Specific Category) */}
          {(activeTab === 'home' ||
            activeTab === 'all' ||
            activeTab === 'favorites' ||
            activeTab === 'pinned' ||
            (activeTab === 'categories' && selectedCategory)) && (
            <div className="space-y-6">
              {/* Quick Add Bar right on top */}
              <QuickAddBar
                categories={categories}
                onQuickAdd={(data) => handleSaveLink(data)}
                onOpenFullModal={(prefillUrl) => handleOpenCreateLink(prefillUrl)}
              />

              {/* Category Breadcrumb Header if category is selected */}
              {selectedCategory && currentCategoryObj && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Đang lọc theo môn:</span>
                    <span className="font-extrabold text-sm text-blue-700 dark:text-blue-300">
                      {currentCategoryObj.name} ({sortedLinks.length} liên kết)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer"
                  >
                    Xem tất cả &times;
                  </button>
                </div>
              )}

              {/* Resource Link Grid / List Display */}
              {sortedLinks.length === 0 ? (
                /* Empty / No Results State */
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950/50 my-4 shadow-2xs">
                  <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-xs">
                    <FolderSearch className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-blue-700 dark:text-blue-300">
                    {searchQuery ? 'Chưa tìm thấy liên kết phù hợp 🔍' : 'Kho liên kết đang trống'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                    {searchQuery
                      ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Hãy thử tìm theo tên trang, mô tả hoặc từ khóa khác.`
                      : 'Hãy bắt đầu lưu trữ các bài giảng, giáo án, video và tài liệu dạy học hữu ích vào kho ngay bây giờ.'}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FilterX className="w-4 h-4" />
                        Xóa bộ lọc tìm kiếm
                      </button>
                    ) : null}

                    <button
                      type="button"
                      id="empty-btn-add-link"
                      onClick={() => handleOpenCreateLink()}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      ＋ Thêm liên kết đầu tiên
                    </button>
                  </div>
                </div>
              ) : isGroupedByCategory && !selectedCategory ? (
                /* Grouped by Subject / Category Accordion View */
                <div className="space-y-5">
                  {categories.map((cat) => {
                    const catLinks = sortedLinks.filter((l) => l.categoryId === cat.id);
                    if (catLinks.length === 0 && searchQuery) return null; // hide empty categories if searching
                    return (
                      <CategoryGroupSection
                        key={cat.id}
                        category={cat}
                        links={catLinks}
                        viewMode={viewMode}
                        selectedLinkIds={selectedLinkIds}
                        onToggleSelectLink={handleToggleSelectLink}
                        onToggleFavorite={handleToggleFavorite}
                        onTogglePin={handleTogglePin}
                        onEdit={handleOpenEditLink}
                        onDelete={handleDeleteLink}
                        onShare={handleOpenShareLink}
                        onNotify={(msg) => addToast(msg, 'success')}
                        onAddLinkToCategory={(catId) => handleOpenCreateLink(undefined, catId)}
                        onRecordClick={handleRecordClick}
                      />
                    );
                  })}
                </div>
              ) : viewMode === 'grid' ? (
                /* Standard Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {sortedLinks.map((link) => {
                      const cat = categories.find((c) => c.id === link.categoryId);
                      return (
                        <LinkCard
                          key={link.id}
                          link={link}
                          category={cat}
                          isSelected={selectedLinkIds.has(link.id)}
                          onToggleSelect={isMultiSelectMode ? handleToggleSelectLink : undefined}
                          onToggleFavorite={handleToggleFavorite}
                          onTogglePin={handleTogglePin}
                          onEdit={handleOpenEditLink}
                          onDelete={handleDeleteLink}
                          onShare={handleOpenShareLink}
                          onNotify={(msg) => addToast(msg, 'success')}
                          onSelectCategory={(catId) => setSelectedCategory(catId)}
                          onRecordClick={handleRecordClick}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : viewMode === 'list' ? (
                /* Standard List View */
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {sortedLinks.map((link) => {
                      const cat = categories.find((c) => c.id === link.categoryId);
                      return (
                        <LinkListRow
                          key={link.id}
                          link={link}
                          category={cat}
                          isSelected={selectedLinkIds.has(link.id)}
                          onToggleSelect={isMultiSelectMode ? handleToggleSelectLink : undefined}
                          onToggleFavorite={handleToggleFavorite}
                          onTogglePin={handleTogglePin}
                          onEdit={handleOpenEditLink}
                          onDelete={handleDeleteLink}
                          onShare={handleOpenShareLink}
                          onNotify={(msg) => addToast(msg, 'success')}
                          onSelectCategory={(catId) => setSelectedCategory(catId)}
                          onRecordClick={handleRecordClick}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                /* Compact Table / Row View */
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {sortedLinks.map((link) => {
                      const cat = categories.find((c) => c.id === link.categoryId);
                      return (
                        <LinkCompactRow
                          key={link.id}
                          link={link}
                          category={cat}
                          isSelected={selectedLinkIds.has(link.id)}
                          onToggleSelect={isMultiSelectMode ? handleToggleSelectLink : undefined}
                          onToggleFavorite={handleToggleFavorite}
                          onTogglePin={handleTogglePin}
                          onEdit={handleOpenEditLink}
                          onDelete={handleDeleteLink}
                          onShare={handleOpenShareLink}
                          onNotify={(msg) => addToast(msg, 'success')}
                          onSelectCategory={(catId) => setSelectedCategory(catId)}
                          onRecordClick={handleRecordClick}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 px-6 text-center text-xs text-slate-400">
          <p>
            TÀI NGUYÊN KHỐI HAI &copy; {new Date().getFullYear()} • Kho Liên Kết Thông Minh Dành Cho Giáo Viên Tiểu Học
          </p>
        </footer>
      </div>
    </div>
  );
}
