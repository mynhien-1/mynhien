import React from 'react';
import {
  Sparkles,
  BookOpen,
  Presentation,
  Gamepad2,
  Video,
  FileText,
  Image,
  Wrench,
  CheckSquare,
  FileSpreadsheet,
  Folder,
  Globe,
  GraduationCap,
  Music,
  Bookmark,
  ExternalLink,
  Tag,
  Star,
  Pin,
  Laptop,
  Palette,
  Lightbulb,
  Search,
  School,
  FileCode,
  Library,
  Layers,
  Award,
  Calendar,
  Compass,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  BookOpen,
  Presentation,
  Gamepad2,
  Video,
  FileText,
  Image,
  Wrench,
  CheckSquare,
  FileSpreadsheet,
  Folder,
  Globe,
  GraduationCap,
  Music,
  Bookmark,
  ExternalLink,
  Tag,
  Star,
  Pin,
  Laptop,
  Palette,
  Lightbulb,
  Search,
  School,
  FileCode,
  Library,
  Layers,
  Award,
  Calendar,
  Compass,
};

export const AVAILABLE_ICONS = [
  { name: 'Sparkles', label: 'AI & Thông minh' },
  { name: 'BookOpen', label: 'Giáo án & Sách' },
  { name: 'Presentation', label: 'Bài giảng' },
  { name: 'Gamepad2', label: 'Trò chơi' },
  { name: 'Video', label: 'Video' },
  { name: 'FileText', label: 'Tài liệu' },
  { name: 'Image', label: 'Hình ảnh' },
  { name: 'Wrench', label: 'Công cụ' },
  { name: 'CheckSquare', label: 'Đánh giá' },
  { name: 'FileSpreadsheet', label: 'Biểu mẫu' },
  { name: 'Folder', label: 'Thư mục' },
  { name: 'Globe', label: 'Website' },
  { name: 'GraduationCap', label: 'Học tập' },
  { name: 'School', label: 'Trường học' },
  { name: 'Palette', label: 'Nghệ thuật' },
  { name: 'Music', label: 'Âm nhạc' },
  { name: 'Library', label: 'Thư viện' },
  { name: 'Lightbulb', label: 'Ý tưởng' },
  { name: 'Award', label: 'Khen thưởng' },
];

export const CATEGORY_COLORS = [
  { name: 'indigo', label: 'Tím chàm', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/60', badge: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' },
  { name: 'emerald', label: 'Xanh lục', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/60', badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' },
  { name: 'blue', label: 'Xanh lam', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/60', badge: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' },
  { name: 'amber', label: 'Vàng hổ phách', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/60', badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' },
  { name: 'rose', label: 'Hồng đỏ', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/60', badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300' },
  { name: 'cyan', label: 'Xanh mòng két', bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800/60', badge: 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300' },
  { name: 'violet', label: 'Tím hoa cà', bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/60', badge: 'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300' },
  { name: 'teal', label: 'Xanh ngọc', bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800/60', badge: 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300' },
  { name: 'orange', label: 'Cam tươi', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/60', badge: 'bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300' },
  { name: 'sky', label: 'Xanh da trời', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800/60', badge: 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300' },
  { name: 'slate', label: 'Xám thanh lịch', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
];

export function getCategoryColor(colorName?: string) {
  const match = CATEGORY_COLORS.find(c => c.name === colorName);
  return match || CATEGORY_COLORS[0];
}

interface CategoryIconProps {
  iconName?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName = 'Folder', className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[iconName] || Folder;
  return <IconComponent className={className} />;
};
