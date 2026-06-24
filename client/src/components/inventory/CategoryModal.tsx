import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types/product';
import { X, Boxes, Save, AlertCircle, ChevronDown, Lock } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: any) => void;
  category: Product | null;
}

interface FormData {
  itemName: string;
  itemModel: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  itemType: string;
  category: string;
  status: string;
}

interface FormErrors {
  itemName?: string;
  itemModel?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEM_TYPES = [
  { value: 'smartphones', label: '📱  Smartphones' },
  { value: 'smallphones', label: '📟  Smallphones' },
  { value: 'accessories', label: '🎧  Accessories' },
];

const CATEGORIES = [
  { value: 'mobiles',     label: 'Mobiles' },
  { value: 'accessories', label: 'Accessories' },
];

const STATUSES = [
  { value: 'AVAILABLE', label: 'Available', active: 'bg-emerald-500 text-white', dot: 'bg-emerald-500' },
  { value: 'SUSPENDED', label: 'Suspended', active: 'bg-amber-500 text-white',   dot: 'bg-amber-500'  },
  { value: 'MODIFIED',  label: 'Modified',  active: 'bg-blue-500 text-white',    dot: 'bg-blue-500'   },
];

const EMPTY: FormData = {
  itemName: '', itemModel: '', brand: '',
  minPrice: 0, maxPrice: 0,
  itemType: 'smartphones', category: 'mobiles', status: 'AVAILABLE',
};

const deriveCategory = (type: string) =>
  type === 'smartphones' || type === 'smallphones' ? 'mobiles' : 'accessories';

// ─── Field Components ────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string; id: string; required?: boolean;
  type?: string; value: string | number; placeholder?: string;
  error?: string; prefix?: string; autoFocus?: boolean;
  onChange: (v: string) => void;
}> = ({ label, id, required, type = 'text', value, placeholder, error, prefix, autoFocus, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-black dark:text-white">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-body dark:text-bodydark pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={id} type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
        aria-required={required} aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-transparent py-2.5 text-sm text-black dark:text-white
          placeholder:text-body/40 dark:placeholder:text-bodydark/40
          outline-none transition-all duration-200
          focus:ring-2 focus:ring-primary/30 focus:border-primary
          ${prefix ? 'pl-10 pr-4' : 'px-4'}
          ${error
            ? 'border-red-400 dark:border-red-500/70 bg-red-50/30 dark:bg-red-900/10'
            : 'border-stroke dark:border-strokedark'}`}
      />
    </div>
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const SelectField: React.FC<{
  label: string; id: string; required?: boolean;
  value: string; options: { value: string; label: string }[];
  isAutoFilled?: boolean; onChange: (v: string) => void;
}> = ({ label, id, required, value, options, isAutoFilled, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-black dark:text-white flex items-center gap-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      {isAutoFilled && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <Lock className="w-2.5 h-2.5" /> Auto
        </span>
      )}
    </label>
    <div className="relative">
      <select
        id={id} value={value} aria-required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-xl border py-2.5 pl-4 pr-10 text-sm
          outline-none cursor-pointer transition-all duration-200
          focus:ring-2 focus:ring-primary/30 focus:border-primary
          ${isAutoFilled
            ? 'bg-blue-50/60 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300'
            : 'bg-transparent border-stroke dark:border-strokedark text-black dark:text-white dark:bg-boxdark'}`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {isAutoFilled
        ? <Lock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400" />
        : <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-body dark:text-bodydark" />}
    </div>
  </div>
);

// ─── Main Modal ──────────────────────────────────────────────────────────────

const CategoryModal: React.FC<CategoryModalProps> = ({ open, onClose, onSave, category }) => {
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [categoryAutoFilled, setCategoryAutoFilled] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isEditing = Boolean(category);

  useEffect(() => {
    if (category) {
      // Derive a safe fallback for itemType from the product's own category field
      // so an accessory is never mis-classified as 'smartphones'
      const fallbackItemType =
        category.itemType ?? (category.category === 'accessories' ? 'accessories' : 'smartphones');

      setFormData({
        itemName:  category.itemName,
        itemModel: category.itemModel,
        brand:     category.brand,
        minPrice:  category.minPrice,
        maxPrice:  category.maxPrice,
        itemType:  fallbackItemType,
        category:  category.category,
        status:    category.status ?? 'AVAILABLE',
      });
      setCategoryAutoFilled(
        category.category === deriveCategory(fallbackItemType),
      );
    } else {
      setFormData(EMPTY);
      setCategoryAutoFilled(true);
    }
    setErrors({});
    setIsSaving(false);
  }, [category, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleItemTypeChange = (newType: string) => {
    setFormData((prev) => ({
      ...prev,
      itemType: newType,
      category: categoryAutoFilled ? deriveCategory(newType) : prev.category,
    }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.itemName.trim())           errs.itemName  = 'Model name is required.';
    if (!formData.itemModel.trim())          errs.itemModel = 'Model code is required.';
    if (!formData.brand.trim())              errs.brand     = 'Brand is required.';
    if (formData.minPrice <= 0)              errs.minPrice  = 'Must be greater than 0.';
    if (formData.maxPrice <= formData.minPrice) errs.maxPrice = 'Must exceed minimum price.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try { await onSave(formData); } finally { setIsSaving(false); }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar
          rounded-2xl bg-white dark:bg-boxdark
          shadow-[0_24px_64px_-12px_rgba(0,0,0,0.4)]
          border border-stroke dark:border-strokedark flex flex-col"
        style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-primary via-blue-500 to-indigo-500 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stroke dark:border-strokedark flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20">
              <Boxes className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold text-black dark:text-white">
                {isEditing ? 'Edit Product Model' : 'Add Product Model'}
              </h2>
              <p className="text-xs text-body dark:text-bodydark mt-0.5">
                {isEditing ? 'Update the product model details' : 'Create a new product model'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-body dark:text-bodydark
              hover:bg-gray-2 dark:hover:bg-meta-4 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Product Identity */}
          <Field
            label="Model Name" id="itemName" required autoFocus
            value={formData.itemName} placeholder="e.g. Samsung Galaxy A10s"
            error={errors.itemName} onChange={(v) => set('itemName', v)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Model Code / SKU" id="itemModel" required
              value={formData.itemModel} placeholder="e.g. SM-A107F"
              error={errors.itemModel} onChange={(v) => set('itemModel', v)}
            />
            <Field
              label="Brand" id="brand" required
              value={formData.brand} placeholder="e.g. Samsung"
              error={errors.brand} onChange={(v) => set('brand', v)}
            />
          </div>

          <div className="border-t border-stroke dark:border-strokedark" />

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Min Price" id="minPrice" required type="number"
              value={formData.minPrice === 0 ? '' : formData.minPrice}
              placeholder="0" prefix="KES"
              error={errors.minPrice} onChange={(v) => set('minPrice', Number(v))}
            />
            <Field
              label="Max Price" id="maxPrice" required type="number"
              value={formData.maxPrice === 0 ? '' : formData.maxPrice}
              placeholder="0" prefix="KES"
              error={errors.maxPrice} onChange={(v) => set('maxPrice', Number(v))}
            />
          </div>

          <div className="border-t border-stroke dark:border-strokedark" />

          {/* Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Product Type" id="itemType" required
              value={formData.itemType} options={ITEM_TYPES}
              onChange={handleItemTypeChange}
            />
            <div>
              <SelectField
                label="Sub-Category" id="category"
                value={formData.category} options={CATEGORIES}
                isAutoFilled={categoryAutoFilled}
                onChange={(v) => { setCategoryAutoFilled(false); set('category', v); }}
              />
              {!categoryAutoFilled && (
                <button
                  type="button"
                  onClick={() => { setCategoryAutoFilled(true); set('category', deriveCategory(formData.itemType)); }}
                  className="mt-1 text-xs text-primary hover:underline font-medium"
                >
                  ↩ Reset to auto
                </button>
              )}
            </div>
          </div>

          {/* Status — edit mode only */}
          {isEditing && (
            <>
              <div className="border-t border-stroke dark:border-strokedark" />
              <div>
                <p className="text-sm font-semibold text-black dark:text-white mb-2">Status</p>
                <div role="radiogroup" aria-label="Status" className="flex rounded-xl border border-stroke dark:border-strokedark overflow-hidden">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value} type="button" role="radio" aria-checked={formData.status === s.value}
                      onClick={() => set('status', s.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200
                        ${formData.status === s.value
                          ? s.active
                          : 'bg-transparent text-body dark:text-bodydark hover:bg-gray-2 dark:hover:bg-meta-4'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${formData.status === s.value ? 'bg-white/80' : s.dot}`} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4
          border-t border-stroke dark:border-strokedark
          bg-gray-2/60 dark:bg-meta-4/20 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose} disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-stroke dark:border-strokedark
              text-black dark:text-white hover:bg-gray-2 dark:hover:bg-meta-4
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
              bg-primary text-white hover:bg-opacity-90 active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200 shadow-md shadow-primary/25"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Add Product Model'}
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CategoryModal;