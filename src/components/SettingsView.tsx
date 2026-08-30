import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  Download,
  Upload,
  Database,
  Trash2,
  Layers,
  History,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Flame,
  Check,
} from 'lucide-react';
import { Category, ResourceLink, ThemeOption } from '../types';
import { StorageService, BackupSnapshot } from '../services/storage';

interface SettingsViewProps {
  theme: ThemeOption;
  onThemeChange: (theme: ThemeOption) => void;
  categories: Category[];
  links: ResourceLink[];
  onOpenCategoryManager: () => void;
  onOpenDeployGuide: () => void;
  onRefreshData: () => void;
  onNotify: (msg: string) => void;
  onRequestResetAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onThemeChange,
  categories,
  links,
  onOpenCategoryManager,
  onOpenDeployGuide,
  onRefreshData,
  onNotify,
  onRequestResetAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backups, setBackups] = useState<BackupSnapshot[]>(() => StorageService.getBackups());
  const [backupName, setBackupName] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  const activeLinksCount = links.filter((l) => !l.isTrash).length;

  const handleExport = () => {
    const json = StorageService.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tai-Nguyen-Khoi-Hai-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Đã xuất thành công tệp dữ liệu sao lưu (.JSON)!');
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = StorageService.importJSON(content, importMode);
        if (result.success) {
          onRefreshData();
          setBackups(StorageService.getBackups());
          onNotify(result.message);
        } else {
          onNotify(result.message);
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleCreateBackup = () => {
    const backup = StorageService.createBackup(backupName.trim() || undefined);
    setBackups(StorageService.getBackups());
    setBackupName('');
    onNotify(`Đã tạo thành công bản sao lưu "${backup.name}"!`);
  };

  const handleRestoreBackup = (b: BackupSnapshot) => {
    const ok = StorageService.restoreBackup(b.id);
    if (ok) {
      onRefreshData();
      onNotify(`Đã khôi phục dữ liệu từ bản sao lưu "${b.name}"!`);
    } else {
      onNotify('Lỗi khôi phục bản sao lưu.');
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    StorageService.deleteBackup(backupId);
    setBackups(StorageService.getBackups());
    onNotify('Đã xóa bản sao lưu.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-black text-blue-900 dark:text-blue-200">
          Cài đặt hệ thống
        </h2>
        <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
          Tùy chỉnh giao diện hiển thị, quản lý danh mục và dữ liệu an toàn của kho liên kết
        </p>
      </div>

      {/* 1. Theme Configuration */}
      <section className="p-6 rounded-3xl bg-white/95 dark:bg-[#191428] border border-purple-100 dark:border-purple-950/60 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100/70 dark:bg-purple-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
              Giao diện hiển thị
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn tông màu sáng, tối hoặc tự động theo thiết bị của bạn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            id="theme-btn-light"
            onClick={() => onThemeChange('light')}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-purple-50 dark:bg-purple-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/20'
                : 'bg-white dark:bg-slate-800 border-purple-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50/50'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            Chế độ sáng
            {theme === 'light' && <Check className="w-4 h-4 ml-1 text-blue-600" />}
          </button>

          <button
            type="button"
            id="theme-btn-dark"
            onClick={() => onThemeChange('dark')}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-purple-50 dark:bg-purple-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/20'
                : 'bg-white dark:bg-slate-800 border-purple-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50/50'
            }`}
          >
            <Moon className="w-4 h-4 text-blue-400" />
            Chế độ tối
            {theme === 'dark' && <Check className="w-4 h-4 ml-1 text-blue-600" />}
          </button>

          <button
            type="button"
            id="theme-btn-system"
            onClick={() => onThemeChange('system')}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-purple-50 dark:bg-purple-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/20'
                : 'bg-white dark:bg-slate-800 border-purple-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50/50'
            }`}
          >
            <Laptop className="w-4 h-4 text-slate-500" />
            Theo hệ thống
            {theme === 'system' && <Check className="w-4 h-4 ml-1 text-blue-600" />}
          </button>
        </div>
      </section>

      {/* 2. Category Management Shortcut */}
      <section className="p-6 rounded-3xl bg-white/95 dark:bg-[#191428] border border-purple-100 dark:border-purple-950/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100/70 dark:bg-purple-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
              Quản lý danh mục ({categories.length} nhóm)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tùy biến tên, biểu tượng và màu sắc các môn học & loại tài nguyên
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCategoryManager}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          Mở danh mục
        </button>
      </section>

      {/* 3. Data Import & Export */}
      <section className="p-6 rounded-3xl bg-white/95 dark:bg-[#191428] border border-purple-100 dark:border-purple-950/60 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100/70 dark:bg-purple-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
              Quản lý và sao lưu dữ liệu (Import / Export)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Xuất tệp sao lưu JSON hoặc nhập danh sách liên kết từ máy tính
            </p>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Box */}
          <div className="p-5 rounded-2xl bg-purple-50/40 dark:bg-slate-800/50 border border-purple-100 dark:border-slate-700/70 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Xuất dữ liệu kho (.JSON)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tải về toàn bộ {activeLinksCount} liên kết và {categories.length} danh mục vào một tệp JSON an toàn.
              </p>
            </div>
            <button
              type="button"
              id="btn-export-json-file"
              onClick={handleExport}
              className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 hover:border-blue-400 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs hover:bg-purple-50/60 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Tải xuống tệp JSON
            </button>
          </div>

          {/* Import Box */}
          <div className="p-5 rounded-2xl bg-purple-50/40 dark:bg-slate-800/50 border border-purple-100 dark:border-slate-700/70 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  Nhập dữ liệu từ tệp JSON
                </h4>
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                  className="text-[11px] font-semibold rounded-lg border border-purple-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 cursor-pointer"
                >
                  <option value="merge">Gộp thêm (An toàn)</option>
                  <option value="replace">Ghi đè toàn bộ</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Nhập danh sách tài nguyên chia sẻ từ giáo viên khác hoặc từ bản sao lưu trước đó.
              </p>
            </div>
            <button
              type="button"
              id="btn-import-json-file"
              onClick={handleTriggerImport}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Chọn tệp JSON để nhập
            </button>
          </div>
        </div>

        {/* Local Snapshots / Backup History */}
        <div className="pt-3 border-t border-purple-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Bản sao lưu nhanh trên trình duyệt ({backups.length})
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Tên bản sao lưu..."
                className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs w-48 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleCreateBackup}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                + Tạo sao lưu
              </button>
            </div>
          </div>

          {backups.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Chưa có bản sao lưu nhanh nào. Nhấn "+ Tạo sao lưu" để tạo điểm khôi phục tức thời.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {backups.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 dark:bg-slate-800/40 border border-purple-100 dark:border-slate-700/60 text-xs"
                >
                  <div>
                    <span className="font-bold text-blue-900 dark:text-blue-200">{b.name}</span>
                    <span className="text-slate-400 ml-2">({b.linksCount} liên kết)</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(b.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRestoreBackup(b)}
                      className="px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold cursor-pointer"
                    >
                      Khôi phục
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBackup(b.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Deployment Documentation Link */}
      <section className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-purple-100/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
              Hướng dẫn triển khai Vercel & Firebase
            </h3>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
              Xem chi tiết từng bước cấu hình biến môi trường, deploy miễn phí và tích hợp Google Auth
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDeployGuide}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          Xem hướng dẫn Deploy
        </button>
      </section>

      {/* 5. Dangerous Zone */}
      <section className="p-6 rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
              Khu vực nhạy cảm & Xóa dữ liệu
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              Xóa toàn bộ liên kết đã lưu trên trình duyệt và đặt lại kho tài nguyên trống
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            id="btn-reset-all-data"
            onClick={onRequestResetAll}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Xóa toàn bộ liên kết (Đặt lại kho trống)
          </button>
        </div>
      </section>
    </div>
  );
};
