import { Category, ResourceLink, ThemeOption } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_RESOURCE_LINKS } from '../data/defaultData';

const LINKS_KEY = 'tai_nguyen_khoi_hai_links_v2';
const LEGACY_LINKS_KEY_V1 = 'tai_nguyen_khoi_hai_links_v1';
const LEGACY_LINKS_KEY_OLD = 'tai_nguyen_khoi_hai_links';
const SAFETY_BACKUP_KEY = 'tai_nguyen_safety_vault_backup';
const CATEGORIES_KEY = 'tai_nguyen_khoi_hai_categories_v1';
const THEME_KEY = 'tai_nguyen_khoi_hai_theme';
const BACKUPS_KEY = 'tai_nguyen_khoi_hai_backups';

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  name: string;
  linksCount: number;
  data: {
    links: ResourceLink[];
    categories: Category[];
  };
}

export const StorageService = {
  /**
   * Safely loads links with comprehensive fallback across all storage keys
   * and auto-migrates existing data without any data loss.
   */
  getLinks(): ResourceLink[] {
    try {
      let candidateLinks: ResourceLink[] = [];

      // 1. Primary storage key (v2)
      const dataV2 = localStorage.getItem(LINKS_KEY);
      if (dataV2) {
        try {
          const parsed = JSON.parse(dataV2);
          if (Array.isArray(parsed) && parsed.length > 0) {
            candidateLinks = parsed;
          }
        } catch {
          // ignore corrupted json and try fallbacks
        }
      }

      // 2. Secondary fallback: Check v1 key if v2 is empty
      if (candidateLinks.length === 0) {
        const dataV1 = localStorage.getItem(LEGACY_LINKS_KEY_V1);
        if (dataV1) {
          try {
            const parsed = JSON.parse(dataV1);
            if (Array.isArray(parsed) && parsed.length > 0) {
              candidateLinks = parsed;
              // Mirror into v2 for continuous storage
              localStorage.setItem(LINKS_KEY, JSON.stringify(parsed));
            }
          } catch {
            // ignore
          }
        }
      }

      // 3. Tertiary fallback: Check older generic key
      if (candidateLinks.length === 0) {
        const dataOld = localStorage.getItem(LEGACY_LINKS_KEY_OLD);
        if (dataOld) {
          try {
            const parsed = JSON.parse(dataOld);
            if (Array.isArray(parsed) && parsed.length > 0) {
              candidateLinks = parsed;
              localStorage.setItem(LINKS_KEY, JSON.stringify(parsed));
            }
          } catch {
            // ignore
          }
        }
      }

      // 4. Quaternary fallback: Check emergency safety backup
      if (candidateLinks.length === 0) {
        const safetyBackup = localStorage.getItem(SAFETY_BACKUP_KEY);
        if (safetyBackup) {
          try {
            const parsed = JSON.parse(safetyBackup);
            if (Array.isArray(parsed) && parsed.length > 0) {
              candidateLinks = parsed;
              localStorage.setItem(LINKS_KEY, JSON.stringify(parsed));
            }
          } catch {
            // ignore
          }
        }
      }

      // If no candidate links found anywhere, return empty/initial
      if (candidateLinks.length === 0) {
        if (!dataV2) {
          localStorage.setItem(LINKS_KEY, JSON.stringify(INITIAL_RESOURCE_LINKS));
        }
        return INITIAL_RESOURCE_LINKS;
      }

      // Clean & normalize categories (map legacy cat-ai to cat-cong-cu if any)
      const sanitized = candidateLinks.map((l) => {
        const link = { ...l };
        if (link.categoryId === 'cat-ai') {
          link.categoryId = 'cat-cong-cu';
        }
        if (!link.id) {
          link.id = 'link-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
        }
        if (typeof link.isFavorite !== 'boolean') link.isFavorite = false;
        if (typeof link.isPinned !== 'boolean') link.isPinned = false;
        if (typeof link.isTrash !== 'boolean') link.isTrash = false;
        if (!Array.isArray(link.tags)) link.tags = [];
        return link;
      });

      return sanitized;
    } catch (e) {
      console.error('Failed to parse links from localStorage:', e);
      return INITIAL_RESOURCE_LINKS;
    }
  },

  /**
   * Safely saves links to main storage and redundant emergency backup
   */
  saveLinks(links: ResourceLink[]): void {
    try {
      const serialized = JSON.stringify(links);
      localStorage.setItem(LINKS_KEY, serialized);
      // Keep safety backup copy whenever links are saved
      if (links.length > 0) {
        localStorage.setItem(SAFETY_BACKUP_KEY, serialized);
      }
    } catch (e) {
      console.error('Failed to save links to localStorage:', e);
    }
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      if (!data) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      const parsed: Category[] = JSON.parse(data);
      // Filter out 'cat-ai' or categories named 'AI'
      const filtered = parsed.filter((c) => c.id !== 'cat-ai' && c.name.trim().toLowerCase() !== 'ai');
      if (filtered.length !== parsed.length) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
      }
      return filtered.length > 0 ? filtered : DEFAULT_CATEGORIES;
    } catch (e) {
      console.error('Failed to parse categories from localStorage:', e);
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage:', e);
    }
  },

  getTheme(): ThemeOption {
    try {
      const theme = localStorage.getItem(THEME_KEY) as ThemeOption;
      return theme || 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: ThemeOption): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  },

  getBackups(): BackupSnapshot[] {
    try {
      const raw = localStorage.getItem(BACKUPS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  createBackup(customName?: string): BackupSnapshot {
    const links = this.getLinks();
    const categories = this.getCategories();
    const now = new Date();
    const backup: BackupSnapshot = {
      id: 'backup-' + Date.now(),
      timestamp: now.toISOString(),
      name: customName || `Bản sao lưu ngày ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      linksCount: links.filter(l => !l.isTrash).length,
      data: {
        links,
        categories,
      },
    };

    const currentBackups = this.getBackups();
    // Keep max 10 latest backups
    const updated = [backup, ...currentBackups].slice(0, 10);
    localStorage.setItem(BACKUPS_KEY, JSON.stringify(updated));
    return backup;
  },

  restoreBackup(backupId: string): boolean {
    const backups = this.getBackups();
    const target = backups.find(b => b.id === backupId);
    if (!target || !target.data) return false;

    this.saveLinks(target.data.links);
    this.saveCategories(target.data.categories);
    return true;
  },

  deleteBackup(backupId: string): void {
    const backups = this.getBackups().filter(b => b.id !== backupId);
    localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
  },

  resetAllData(): void {
    localStorage.setItem(LINKS_KEY, JSON.stringify(INITIAL_RESOURCE_LINKS));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  },

  exportJSON(): string {
    const payload = {
      app: 'TÀI NGUYÊN KHỐI HAI',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      categories: this.getCategories(),
      links: this.getLinks(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importJSON(jsonString: string, mode: 'merge' | 'replace' = 'merge'): { success: boolean; message: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!Array.isArray(parsed.links) && !Array.isArray(parsed))) {
        return { success: false, message: 'Tệp dữ liệu không đúng cấu trúc hợp lệ.' };
      }

      const importedLinks: ResourceLink[] = Array.isArray(parsed) ? parsed : (parsed.links || []);
      const importedCategories: Category[] = Array.isArray(parsed.categories) ? parsed.categories : [];

      if (importedLinks.length === 0) {
        return { success: false, message: 'Tệp không chứa liên kết nào để nhập.' };
      }

      // Validate link items
      const validLinks = importedLinks.filter(l => l && typeof l.title === 'string' && typeof l.url === 'string');

      if (mode === 'replace') {
        this.saveLinks(validLinks);
        if (importedCategories.length > 0) {
          this.saveCategories(importedCategories);
        }
      } else {
        // Merge mode: append non-duplicate URLs or assign new IDs
        const existingLinks = this.getLinks();
        const existingUrls = new Set(existingLinks.map(l => l.url.trim().toLowerCase()));
        const existingCategories = this.getCategories();
        const existingCatIds = new Set(existingCategories.map(c => c.id));

        // Add missing categories
        const mergedCategories = [...existingCategories];
        for (const cat of importedCategories) {
          if (cat && cat.id && !existingCatIds.has(cat.id)) {
            mergedCategories.push(cat);
            existingCatIds.add(cat.id);
          }
        }
        this.saveCategories(mergedCategories);

        const newLinksToAdd: ResourceLink[] = [];
        for (const link of validLinks) {
          if (!existingUrls.has(link.url.trim().toLowerCase())) {
            newLinksToAdd.push({
              ...link,
              id: 'link-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
              createdAt: link.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }

        const mergedLinks = [...newLinksToAdd, ...existingLinks];
        this.saveLinks(mergedLinks);
      }

      return {
        success: true,
        message: `Đã nhập thành công ${validLinks.length} liên kết vào kho!`,
        count: validLinks.length,
      };
    } catch (e) {
      console.error('Import JSON Error:', e);
      return { success: false, message: 'Lỗi giải mã tệp JSON. Vui lòng kiểm tra lại định dạng tệp.' };
    }
  },
};

// URL validation and normalization
export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

export function isValidUrl(input: string): boolean {
  if (!input || !input.trim()) return false;
  try {
    const fullUrl = normalizeUrl(input);
    const parsed = new URL(fullUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Smart metadata inference for educational links
export interface SmartLinkSuggestion {
  suggestedTitle: string;
  suggestedCategoryId: string;
  suggestedTags: string[];
  suggestedDescription: string;
}

export function detectLinkMetadata(url: string, categories: Category[]): SmartLinkSuggestion {
  const norm = normalizeUrl(url).toLowerCase();
  const domain = extractDomain(norm).toLowerCase();

  let suggestedCategoryId = categories[0]?.id || 'cat-khac';
  let suggestedTitle = '';
  let suggestedTags: string[] = [];
  let suggestedDescription = '';

  const findCat = (idSubstring: string) =>
    categories.find(c => c.id.toLowerCase().includes(idSubstring) || c.name.toLowerCase().includes(idSubstring))?.id;

  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    suggestedCategoryId = findCat('video') || findCat('khac') || suggestedCategoryId;
    suggestedTitle = 'Video Bài giảng / Phim hoạt hình minh họa';
    suggestedTags = ['video', 'bài giảng', 'hoạt hình'];
    suggestedDescription = 'Video tư liệu bài học trực quan cho học sinh';
  } else if (domain.includes('quizizz.com') || domain.includes('kahoot') || domain.includes('wordwall') || domain.includes('blooket') || domain.includes('liveworksheets')) {
    suggestedCategoryId = findCat('tro-choi') || findCat('game') || suggestedCategoryId;
    suggestedTitle = domain.includes('quizizz') ? 'Trò chơi trắc nghiệm Quizizz' : domain.includes('wordwall') ? 'Trò chơi tương tác Wordwall' : 'Trò chơi củng cố kiến thức';
    suggestedTags = ['trò chơi', 'khởi động', 'ôn tập', 'tương tác'];
    suggestedDescription = 'Trò chơi trực tuyến tạo hứng thú và củng cố bài học';
  } else if (domain.includes('canva.com')) {
    suggestedCategoryId = findCat('ai') || findCat('phan-mem') || suggestedCategoryId;
    suggestedTitle = 'Thiết kế bài giảng sinh động Canva';
    suggestedTags = ['canva', 'thiết kế', 'slide'];
    suggestedDescription = 'Mẫu slide bài giảng và phiếu bài tập đẹp mắt';
  } else if (domain.includes('chatgpt.com') || domain.includes('openai.com') || domain.includes('claude.ai') || domain.includes('gemini.google') || domain.includes('copilot')) {
    suggestedCategoryId = findCat('ai') || findCat('phan-mem') || suggestedCategoryId;
    suggestedTitle = domain.includes('chatgpt') ? 'Trợ lý AI soạn giáo án ChatGPT' : 'Trợ lý trí tuệ nhân tạo AI';
    suggestedTags = ['ai', 'trợ lý', 'soạn giáo án', 'ý tưởng'];
    suggestedDescription = 'Công cụ AI hỗ trợ soạn bài và xây dựng kịch bản dạy học';
  } else if (domain.includes('hanhtrangso') || domain.includes('sachmem') || domain.includes('hoc10') || domain.includes('ebool')) {
    suggestedCategoryId = findCat('sach') || findCat('toan') || suggestedCategoryId;
    suggestedTitle = 'Sách giáo khoa điện tử & Học liệu số';
    suggestedTags = ['sgk', 'sách điện tử', 'bộ sách'];
    suggestedDescription = 'Học liệu số và sách điện tử theo chương trình GDPT 2018';
  } else if (domain.includes('vioedu') || domain.includes('violympic') || domain.includes('mathx') || domain.includes('olm.vn')) {
    suggestedCategoryId = findCat('toan') || suggestedCategoryId;
    suggestedTitle = domain.includes('olm') ? 'Luyện tập trực tuyến OLM' : domain.includes('vioedu') ? 'Đấu trường Toán học VioEdu' : 'Luyện tập Toán học trực tuyến';
    suggestedTags = ['toán 2', 'luyện tập', 'bài tập'];
    suggestedDescription = 'Nền tảng học và làm bài tập trực tuyến';
  } else if (domain.includes('violet.vn')) {
    suggestedCategoryId = findCat('giao-an') || findCat('khac') || suggestedCategoryId;
    suggestedTitle = 'Thư viện bài giảng & Giáo án điện tử';
    suggestedTags = ['giáo án', 'bài giảng', 'violet'];
    suggestedDescription = 'Kho chia sẻ giáo án và tư liệu dạy học phong phú';
  } else if (domain.includes('padlet.com') || domain.includes('mentimeter') || domain.includes('slido')) {
    suggestedCategoryId = findCat('ai') || findCat('phan-mem') || suggestedCategoryId;
    suggestedTitle = 'Bảng tương tác lớp học Padlet';
    suggestedTags = ['tương tác', 'lớp học số'];
    suggestedDescription = 'Bảng số tương tác thu thập ý kiến và bài làm của học sinh';
  } else {
    // Default capitalization from domain
    if (domain) {
      suggestedTitle = domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  }

  return {
    suggestedTitle,
    suggestedCategoryId,
    suggestedTags,
    suggestedDescription,
  };
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = extractDomain(url);
    if (!domain) return '';
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  } catch {
    return '';
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Copy to clipboard failed:', err);
    return false;
  }
}

// Generate structured text ready for Zalo / Messenger / Email
export function generateShareableVaultText(links: ResourceLink[], categories: Category[]): string {
  const activeLinks = links.filter(l => !l.isTrash);
  const catMap = new Map<string, string>();
  categories.forEach(c => catMap.set(c.id, c.name));

  let output = `📚 KHO LIÊN KẾT THÔNG MINH - TÀI NGUYÊN KHỐI HAI\n`;
  output += `🌟 Lưu một lần – Tìm thật nhanh – Chia sẻ thật dễ\n`;
  output += `📅 Cập nhật ngày: ${new Date().toLocaleDateString('vi-VN')}\n`;
  output += `📊 Tổng số: ${activeLinks.length} tài nguyên dạy học chọn lọc\n`;
  output += `--------------------------------------------------\n\n`;

  // Group by category
  const groups: { [catId: string]: ResourceLink[] } = {};
  activeLinks.forEach(l => {
    const catId = l.categoryId || 'cat-khac';
    if (!groups[catId]) groups[catId] = [];
    groups[catId].push(l);
  });

  categories.forEach(cat => {
    const items = groups[cat.id];
    if (items && items.length > 0) {
      output += `📁 DANH MỤC: ${cat.name.toUpperCase()} (${items.length})\n`;
      items.forEach((item, index) => {
        output += `  ${index + 1}. ${item.title}\n`;
        output += `     🔗 ${item.url}\n`;
        if (item.description) {
          output += `     📝 ${item.description}\n`;
        }
      });
      output += `\n`;
    }
  });

  output += `--------------------------------------------------\n`;
  output += `💡 Mẹo: Nhấn vào liên kết để mở trực tiếp tài nguyên bài học!`;
  return output;
}
