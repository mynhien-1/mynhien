import { Category, ResourceLink } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-giao-an', name: 'Giáo án', iconName: 'BookOpen', color: 'emerald' },
  { id: 'cat-bai-giang', name: 'Bài giảng', iconName: 'Presentation', color: 'blue' },
  { id: 'cat-tro-choi', name: 'Trò chơi học tập', iconName: 'Gamepad2', color: 'amber' },
  { id: 'cat-video', name: 'Video', iconName: 'Video', color: 'rose' },
  { id: 'cat-tai-lieu', name: 'Tài liệu', iconName: 'FileText', color: 'cyan' },
  { id: 'cat-hinh-anh', name: 'Hình ảnh', iconName: 'Image', color: 'violet' },
  { id: 'cat-cong-cu', name: 'Công cụ giáo viên', iconName: 'Wrench', color: 'teal' },
  { id: 'cat-kiem-tra', name: 'Kiểm tra – đánh giá', iconName: 'CheckSquare', color: 'orange' },
  { id: 'cat-bieu-mau', name: 'Văn bản – biểu mẫu', iconName: 'FileSpreadsheet', color: 'sky' },
  { id: 'cat-khac', name: 'Khác', iconName: 'Folder', color: 'slate' },
];

export const INITIAL_RESOURCE_LINKS: ResourceLink[] = [];

