export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  description: string;
  categoryId: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isTrash?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  clickCount?: number;
  userId?: string;
  customIcon?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isCustom?: boolean;
}

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortOption = 'newest' | 'oldest' | 'az' | 'za' | 'popular';
export type ActiveTab = 'home' | 'all' | 'favorites' | 'pinned' | 'trash' | 'categories' | 'settings' | 'guide';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export type ThemeOption = 'light' | 'dark' | 'system';
