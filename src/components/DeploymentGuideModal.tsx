import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Server,
  Flame,
  Globe,
  Terminal,
  ShieldCheck,
  Key,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { copyToClipboard } from '../services/storage';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'vercel' | 'firebase' | 'local'>('vercel');

  if (!isOpen) return null;

  const handleCopy = async (code: string, keyName: string) => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedKey(keyName);
      onNotify('Đã sao chép vào bộ nhớ tạm!');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const envSample = `VITE_FIREBASE_API_KEY="AIzaSyAOcOp25MzafswnPzpEDghvunrVS7-umJs"
VITE_FIREBASE_AUTH_DOMAIN="mynhien-14e83.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="mynhien-14e83"
VITE_FIREBASE_STORAGE_BUCKET="mynhien-14e83.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="405377675752"
VITE_FIREBASE_APP_ID="1:405377675752:web:4e2a847b7c4d61e3e9b45d"`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép người dùng đọc và ghi vào kho tài nguyên riêng của họ
    match /teacher_vaults/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Cho phép chia sẻ công khai khi có flag public
    match /public_vaults/{shareId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

  const vercelJson = `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  return (
    <AnimatePresence>
      <div
        id="deploy-guide-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          id="deploy-guide-modal-dialog"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-white/95 dark:bg-[#191428] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-950/80 p-6 sm:p-8 my-6 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-purple-100 dark:border-purple-950/60 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-blue-900 dark:text-blue-200">
                  Hướng Dẫn Cài Đặt & Triển Khai Lên Vercel
                </h3>
                <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
                  Tài liệu chi tiết cấu hình Firebase, biến môi trường và deploy Vercel 100% hoàn chỉnh
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 pt-4 pb-2 border-b border-purple-100 dark:border-purple-950/60 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveSection('vercel')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'vercel'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-purple-50 dark:bg-slate-800 text-blue-900 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-slate-700'
              }`}
            >
              <Server className="w-4 h-4" />
              1. Triển khai Vercel
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('firebase')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'firebase'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-purple-50 dark:bg-slate-800 text-blue-900 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-slate-700'
              }`}
            >
              <Flame className="w-4 h-4" />
              2. Cấu hình Firebase & Google Login
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('local')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'local'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-purple-50 dark:bg-slate-800 text-blue-900 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-slate-700'
              }`}
            >
              <Terminal className="w-4 h-4" />
              3. Cài đặt máy cục bộ
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 text-slate-700 dark:text-slate-300 text-sm">
            {activeSection === 'vercel' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Tương thích hoàn hảo với Vercel
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mt-1 leading-relaxed">
                    Ứng dụng được đóng gói chuẩn Single Page Application (Vite + React 19). Bạn có thể triển khai lên Vercel trong 2 phút hoàn toàn miễn phí.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                    Đẩy mã nguồn lên GitHub
                  </h4>
                  <div className="p-3 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto relative">
                    <code>
                      git init<br />
                      git add .<br />
                      git commit -m "Kho lien ket tai nguyen khoi 2"<br />
                      git branch -M main<br />
                      git remote add origin https://github.com/USERNAME/tai-nguyen-khoi-hai.git<br />
                      git push -u origin main
                    </code>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                    Import vào Vercel
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <li>Truy cập <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">vercel.com/new</a> và đăng nhập.</li>
                    <li>Chọn kho mã nguồn (Repository) của bạn vừa đẩy lên.</li>
                    <li>Framework Preset: Vercel sẽ tự động nhận diện là <strong>Vite</strong>.</li>
                    <li>Build Command: <code className="px-1.5 py-0.5 bg-purple-50 dark:bg-slate-800 rounded font-mono">npm run build</code></li>
                    <li>Output Directory: <code className="px-1.5 py-0.5 bg-purple-50 dark:bg-slate-800 rounded font-mono">dist</code></li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                      Tạo Biến Môi Trường (Environment Variables) trên Vercel
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy(envSample, 'env')}
                      className="px-3 py-1 bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer text-blue-900 dark:text-blue-300"
                    >
                      {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Sao chép mẫu .env
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tại mục <strong>Environment Variables</strong> trên Vercel Dashboard, thêm các biến sau nếu bạn muốn kích hoạt Firebase và Đăng nhập Google:
                  </p>
                  <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
                    {envSample}
                  </pre>
                  <p className="text-[11px] text-slate-400 italic">
                    * Lưu ý: Nếu bạn không điền biến Firebase, ứng dụng vẫn hoạt động 100% hoàn hảo và lưu trữ an toàn bằng LocalStorage trên máy người dùng!
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-blue-900 dark:text-blue-200">
                      Tệp cấu hình SPA (vercel.json)
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy(vercelJson, 'vjson')}
                      className="px-3 py-1 bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer text-blue-900 dark:text-blue-300"
                    >
                      {copiedKey === 'vjson' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Sao chép
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto">
                    {vercelJson}
                  </pre>
                </div>
              </div>
            )}

            {activeSection === 'firebase' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Hướng Dẫn Cấu Hình Firebase (Tùy chọn)
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                    Giúp giáo viên đăng nhập bằng tài khoản Google và đồng bộ kho tài nguyên trên nhiều thiết bị (máy tính trường, laptop ở nhà, điện thoại).
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200">
                    Bước 1: Tạo dự án Firebase
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <li>Vào <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-600 font-semibold underline">Firebase Console</a>, nhấn <strong>Add project</strong>.</li>
                    <li>Đặt tên dự án: <code className="px-1 bg-purple-50 dark:bg-slate-800 rounded">tai-nguyen-khoi-hai</code>.</li>
                    <li>Chọn <strong>Web App</strong> (biểu tượng <code className="px-1 bg-purple-50 dark:bg-slate-800 rounded">&lt;/&gt;</code>) để lấy mã cấu hình SDK.</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200">
                    Bước 2: Bật Google Authentication
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <li>Menu trái chọn <strong>Build &gt; Authentication &gt; Sign-in method</strong>.</li>
                    <li>Nhấn chọn <strong>Google</strong> &gt; Bật công tắc <strong>Enable</strong> &gt; Chọn email hỗ trợ &gt; Lưu.</li>
                    <li>Tại mục <strong>Authorized domains</strong>, thêm tên miền Vercel của bạn (ví dụ: <code className="px-1 bg-purple-50 dark:bg-slate-800 rounded">your-app.vercel.app</code>).</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-blue-900 dark:text-blue-200">
                      Bước 3: Bật Firestore Database & Cấu hình Rules
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy(firestoreRules, 'rules')}
                      className="px-3 py-1 bg-purple-50 dark:bg-slate-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer text-blue-900 dark:text-blue-300"
                    >
                      {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Sao chép Firestore Rules
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-amber-300 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
                    {firestoreRules}
                  </pre>
                </div>
              </div>
            )}

            {activeSection === 'local' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200">
                    Cài đặt và khởi chạy trên máy tính
                  </h4>
                  <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl space-y-2">
                    <p className="text-slate-400"># 1. Cài đặt các thư viện cần thiết</p>
                    <p className="text-emerald-400">npm install</p>
                    <p className="text-slate-400 pt-2"># 2. Khởi chạy máy chủ phát triển (Dev Server)</p>
                    <p className="text-emerald-400">npm run dev</p>
                    <p className="text-slate-400 pt-2"># 3. Đóng gói cho môi trường thực tế (Build)</p>
                    <p className="text-emerald-400">npm run build</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                    Cấu trúc thư mục chính của dự án:
                  </h5>
                  <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
{`├── src/
│   ├── components/      # UI components (LinkCard, LinkModal, Sidebar, Navbar, etc.)
│   ├── data/            # Dữ liệu mặc định (categories, initial teacher links)
│   ├── services/        # LocalStorage, Firebase auth & firestore sync, utilities
│   ├── types.ts         # TypeScript interfaces & types
│   ├── App.tsx          # Main application coordinator
│   └── main.tsx         # React root entry point
├── vercel.json          # Cấu hình routing SPA cho Vercel
├── package.json         # Scripts & dependencies
└── .env.example         # Tài liệu biến môi trường`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-purple-100 dark:border-purple-950/60 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-blue-700/70 dark:text-blue-300/70">
              Sẵn sàng triển khai 100% lên Vercel và các nền tảng đám mây
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
