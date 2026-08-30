import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit2, Trash2, Check, AlertTriangle, Palette, Layers, Sparkles } from 'lucide-react';
import { Category, ResourceLink } from '../types';
import { CategoryIcon, AVAILABLE_ICONS, CATEGORY_COLORS, getCategoryColor } from './IconHelper';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  links: ResourceLink[];
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string, targetReplacementId: string) => void;
  onNotify: (msg: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  links,
  onSaveCategory,
  onDeleteCategory,
  onNotify,
}) => {
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('Folder');
  const [color, setColor] = useState('indigo');
  const [deleteTargetCat, setDeleteTargetCat] = useState<Category | null>(null);
  const [replacementCatId, setReplacementCatId] = useState<string>('cat-khac');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingCat(null);
    setName('');
    setIconName('Folder');
    setColor('indigo');
    setIsCreating(true);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIconName(cat.iconName || 'Folder');
    setColor(cat.color || 'indigo');
    setIsCreating(true);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingCat(null);
    setName('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotify('Vui lòng nhập tên danh mục!');
      return;
    }

    const newCat: Category = {
      id: editingCat ? editingCat.id : 'cat-custom-' + Date.now(),
      name: name.trim(),
      iconName: iconName || 'Folder',
      color: color || 'indigo',
      isCustom: true,
    };

    onSaveCategory(newCat);
    onNotify(editingCat ? `Đã cập nhật danh mục "${name}"!` : `Đã tạo danh mục mới "${name}"!`);
    handleCancelForm();
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetCat) return;
    onDeleteCategory(deleteTargetCat.id, replacementCatId);
    onNotify(`Đã xóa danh mục "${deleteTargetCat.name}". Các liên kết đã được chuyển sang danh mục mới an toàn.`);
    setDeleteTargetCat(null);
  };

  const getLinksCountForCat = (catId: string) => {
    return links.filter((l) => !l.isTrash && l.categoryId === catId).length;
  };

  return (
    <AnimatePresence>
      <div
        id="category-manager-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          id="category-manager-modal-dialog"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl bg-white/95 dark:bg-[#191428] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-950/80 p-6 my-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-purple-100 dark:border-purple-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100/70 dark:bg-purple-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                  Quản lý danh mục tài nguyên
                </h3>
                <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
                  Thêm mới, đổi tên hoặc tùy biến danh mục phân loại bài dạy ({categories.length} danh mục)
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

          <div className="py-5 space-y-6">
            {/* Create/Edit Form */}
            {isCreating ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSave}
                className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {editingCat ? `Đổi tên & cấu hình: ${editingCat.name}` : 'Tạo danh mục phân loại mới'}
                  </h4>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1">
                    Tên danh mục <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-category-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Trải nghiệm sáng tạo, Kỹ năng sống, Kể chuyện..."
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                {/* Choose Icon */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1.5">
                    Biểu tượng đại diện
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-28 overflow-y-auto p-1 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-purple-100 dark:border-slate-700">
                    {AVAILABLE_ICONS.map((ic) => {
                      const isSelected = iconName === ic.name;
                      return (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => setIconName(ic.name)}
                          title={ic.label}
                          className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <CategoryIcon iconName={ic.name} className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Choose Color */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1.5 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" /> Màu sắc đại diện
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map((c) => {
                      const isSelected = color === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setColor(c.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                            c.badge
                          } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 font-bold' : 'opacity-80 hover:opacity-100'}`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${c.text.replace('text-', 'bg-')}`} />
                          {c.label}
                          {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    id="btn-save-category"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    {editingCat ? 'Cập nhật danh mục' : 'Tạo danh mục'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <button
                type="button"
                id="btn-open-create-cat"
                onClick={handleStartCreate}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900/60 hover:border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm danh mục mới
              </button>
            )}

            {/* List of categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = getLinksCountForCat(cat.id);
                const col = getCategoryColor(cat.color);
                const isDefaultOther = cat.id === 'cat-khac';

                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${col.bg} ${col.border}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${col.badge} shadow-2xs`}>
                        <CategoryIcon iconName={cat.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 truncate">
                          {cat.name}
                        </h4>
                        <span className="text-xs text-blue-700/70 dark:text-blue-300/70">
                          {count} liên kết
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        title="Chỉnh sửa"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!isDefaultOther && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetCat(cat);
                            setReplacementCatId(
                              categories.find((c) => c.id !== cat.id)?.id || 'cat-khac'
                            );
                          }}
                          title="Xóa danh mục"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delete with Migration Modal */}
          {deleteTargetCat && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">
                      Xác nhận xóa danh mục
                    </h4>
                    <p className="text-xs text-slate-500">
                      Danh mục: <strong>{deleteTargetCat.name}</strong> ({getLinksCountForCat(deleteTargetCat.id)} liên kết)
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Để đảm bảo <strong>không làm mất liên kết</strong> của bạn, vui lòng chọn danh mục thay thế để chuyển các liên kết hiện có vào đó:
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Chuyển liên kết sang danh mục:
                  </label>
                  <select
                    id="select-replacement-category"
                    value={replacementCatId}
                    onChange={(e) => setReplacementCatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories
                      .filter((c) => c.id !== deleteTargetCat.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetCat(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    id="btn-confirm-delete-cat"
                    onClick={handleConfirmDelete}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xác nhận xóa & Chuyển liên kết
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
