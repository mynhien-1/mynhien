import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  CloudUpload,
  CloudDownload,
  Copy,
  Check,
  ShieldCheck,
  Server,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { ResourceLink, Category } from '../types';
import {
  testDatabaseConnection,
  syncSharedDataToFirestore,
  fetchSharedDataFromFirestore,
} from '../services/firebase';
import { copyToClipboard } from '../services/storage';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: ResourceLink[];
  categories: Category[];
  onUpdateLinksAndCategories: (links: ResourceLink[], categories: Category[]) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  links,
  categories,
  onUpdateLinksAndCategories,
  onNotify,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    tested: boolean;
    success: boolean;
    status: 'connected' | 'permission_denied' | 'error' | 'not_configured';
    message: string;
    projectId: string;
  }>({
    tested: false,
    success: true,
    status: 'connected',
    message: 'Đang kiểm tra kết nối...',
    projectId: 'mynhien-14e83',
  });

  const checkConnection = async () => {
    setIsChecking(true);
    const result = await testDatabaseConnection();
    setDbStatus({
      tested: true,
      ...result,
    });
    setIsChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    const ok = await syncSharedDataToFirestore({ links, categories });
    setIsSyncing(false);
    if (ok) {
      onNotify('Đã đồng bộ thành công toàn bộ liên kết lên Firebase!', 'success');
      checkConnection();
    } else {
      onNotify('Đồng bộ thất bại. Vui lòng kiểm tra lại Rules trên Firebase Console.', 'error');
    }
  };

  const handlePullFromCloud = async () => {
    setIsPulling(true);
    const cloudData = await fetchSharedDataFromFirestore();
    setIsPulling(false);
    if (cloudData && Array.isArray(cloudData.links) && cloudData.links.length > 0) {
      onUpdateLinksAndCategories(cloudData.links, cloudData.categories);
      onNotify(`Đã tải về thành công ${cloudData.links.length} liên kết từ Firebase!`, 'success');
      onClose();
    } else {
      onNotify('Không tìm thấy dữ liệu trên đám mây hoặc chưa có liên kết nào.', 'warning');
    }
  };

  const firestoreRulesText = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const handleCopyRules = async () => {
    const ok = await copyToClipboard(firestoreRulesText);
    if (ok) {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2000);
      onNotify('Đã sao chép mã Rules!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#1a1429] border border-purple-200 dark:border-purple-900/60 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 dark:border-purple-950/80 bg-purple-50/50 dark:bg-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                Trạng thái Kết nối Database
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Firebase Firestore • Dự án <span className="font-bold text-blue-600 dark:text-blue-400">mynhien-14e83</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-purple-100/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
              dbStatus.status === 'connected'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                : dbStatus.status === 'permission_denied'
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
            }`}
          >
            {dbStatus.status === 'connected' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : dbStatus.status === 'permission_denied' ? (
              <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm">
                  {dbStatus.status === 'connected'
                    ? '🟢 Đã Kết Nối Cơ Sở Dữ Liệu'
                    : dbStatus.status === 'permission_denied'
                    ? '🟡 Cần Cập Nhật Rules trên Firebase'
                    : '🔴 Chưa Thể Kết Nối'}
                </span>
                <button
                  type="button"
                  onClick={checkConnection}
                  disabled={isChecking}
                  className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 border border-current text-[11px] font-bold flex items-center gap-1 hover:opacity-80 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Đang kiểm tra...' : 'Kiểm tra lại'}</span>
                </button>
              </div>
              <p className="mt-1 leading-relaxed text-xs opacity-90">{dbStatus.message}</p>
            </div>
          </div>

          {/* Sync Controls */}
          <div className="bg-purple-50/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-purple-100 dark:border-purple-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Hành động Đồng bộ Dữ liệu
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Tổng: <strong className="text-blue-600 dark:text-blue-400">{links.length}</strong> liên kết
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handlePushToCloud}
                disabled={isSyncing}
                className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Đang đẩy lên...' : 'Đẩy dữ liệu lên Firebase'}</span>
              </button>

              <button
                type="button"
                onClick={handlePullFromCloud}
                disabled={isPulling}
                className="w-full py-2.5 px-3.5 rounded-xl bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-blue-700 dark:text-blue-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <CloudDownload className={`w-4 h-4 ${isPulling ? 'animate-pulse' : ''}`} />
                <span>{isPulling ? 'Đang tải về...' : 'Tải dữ liệu từ Firebase về'}</span>
              </button>
            </div>
          </div>

          {/* Quick Rules Setup Guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Quy tắc Rules trên Firebase Console
              </span>
              <a
                href="https://console.firebase.google.com/project/mynhien-14e83/firestore/rules"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px]"
              >
                <span>Mở Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative rounded-2xl bg-slate-900 text-slate-200 p-3 font-mono text-[11px] border border-slate-800">
              <button
                type="button"
                onClick={handleCopyRules}
                className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[10px] font-sans font-bold transition-all cursor-pointer"
              >
                {copiedRules ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
              <pre className="overflow-x-auto pr-16">{firestoreRulesText}</pre>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 <em>Chỉ cần dán đoạn mã này vào tab <strong>Rules</strong> của <strong>Firestore Database</strong> và nhấn <strong>Publish</strong> để mở toàn quyền lưu trữ.</em>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-purple-100 dark:border-purple-950/80 bg-purple-50/30 dark:bg-purple-950/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
