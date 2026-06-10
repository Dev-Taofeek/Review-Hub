'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Package, Info, ImagePlus, X, Upload,
  Loader2, Camera, Sparkles, CheckCircle2,
} from 'lucide-react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useProducts';
import { productsApi, uploadsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router   = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting]       = useState(false);
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imagePreview, setImagePreview]   = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver]           = useState(false);

  const [form, setForm] = useState({
    name: '', brand: '', description: '', category_id: '', price: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const update = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only JPEG, PNG or WebP allowed'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    else if (form.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
    if (!form.brand.trim()) e.brand = 'Brand is required';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 20) e.description = `At least ${20 - form.description.trim().length} more characters needed`;
    if (!form.price) e.price = 'Price is required';
    else if (isNaN(parseFloat(form.price))) e.price = 'Enter a valid price (e.g. 29.99)';
    else if (parseFloat(form.price) < 0) e.price = 'Price cannot be negative';
    setErrors(e);
    if (Object.keys(e).length > 0) toast.error(Object.values(e)[0]!, { duration: 4000 });
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const parsedPrice = parseFloat(form.price);
    setSubmitting(true);
    try {
      const categoryId = form.category_id?.trim() || undefined;
      const res = await productsApi.create({
        name: form.name.trim(), brand: form.brand.trim(),
        description: form.description.trim(),
        ...(categoryId ? { category_id: categoryId } : {}),
        price: parsedPrice,
      });
      const product = res.data!;
      if (imageFile) {
        setUploadingImage(true);
        try {
          await uploadsApi.uploadProductImage(product.id, imageFile, true);
        } catch {
          toast('Product created but image upload failed.', { icon: '⚠️' });
        } finally {
          setUploadingImage(false);
        }
      }
      toast.success('Product added! Now write your review.');
      router.push(`/products/${product.slug}`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;
  if (!isAuthenticated) {
    router.replace('/login?redirectTo=/products/new');
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-8 sm:py-10">

        {/* Back */}
        <nav className="mb-8">
          <Link href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Products
          </Link>
        </nav>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-start">

          {/* ── Left: Form ─────────────────────────────────── */}
          <div className="space-y-6 order-2 lg:order-1">

            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-12 w-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Add a Product</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Share a product with the ReviewHub community</p>
                </div>
              </div>
            </div>

            {/* Info banner */}
            <div className="rounded-xl border border-blue-200/60 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-950/20 px-4 py-3.5 flex gap-3">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Products you add are visible to the whole community. After adding, you'll be taken to the product page to write your review.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product name */}
              <Input
                label="Product Name"
                required
                placeholder='e.g. Sony WH-1000XM5 Wireless Headphones'
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                error={errors.name}
                hint='Use the full official product name'
              />

              {/* Brand */}
              <Input
                label="Brand / Manufacturer"
                required
                placeholder="e.g. Sony, Apple, Samsung, Nike, Dyson"
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
                error={errors.brand}
                hint="The company or manufacturer that makes this product"
              />

              {/* Category + Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  value={form.category_id}
                  onChange={(e) => update('category_id', e.target.value)}
                  options={[
                    { value: '', label: 'Pick the closest category' },
                    ...categories.map((c) => ({ value: c.id, label: `${(c as any).icon ?? ''} ${c.name}`.trim() })),
                  ]}
                />
                <Input
                  label="Retail Price (USD)"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 49.99"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  error={errors.price}
                  hint="Approximate retail price — enter 0 if free"
                />
              </div>

              {/* Description */}
              <Textarea
                label="Product Description"
                required
                rows={6}
                placeholder={`Describe this product:\n• What does it do?\n• Who is it for?\n• Key features?\n\nExample: "The Sony WH-1000XM5 are over-ear wireless headphones with industry-leading noise cancellation, 30-hour battery, and multipoint Bluetooth."`}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                error={errors.description}
                hint={
                  form.description.length < 20
                    ? `${20 - form.description.length} more characters needed`
                    : `${form.description.length} / 5000 characters`
                }
              />

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/[0.07]">
                <Link href="/products">
                  <Button variant="ghost" type="button"
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  loading={submitting}
                  icon={uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  className="shadow-lg shadow-emerald-900/20 px-6"
                >
                  {submitting
                    ? uploadingImage ? 'Uploading image…' : 'Creating product…'
                    : 'Add Product & Write Review'}
                </Button>
              </div>
            </form>
          </div>

          {/* ── Right: Image Upload ─────────────────────────── */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-[80px]">
            <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-sm">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Product Image</p>
                  <p className="text-xs text-slate-400">Makes your listing stand out</p>
                </div>
                <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">Optional</span>
              </div>

              <div className="p-5">
                {imagePreview ? (
                  /* Image preview */
                  <div className="relative">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.07] bg-slate-100 dark:bg-white/[0.04]"
                      style={{ aspectRatio: '4/3' }}>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-[#031A14]/25" />

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors backdrop-blur-sm shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* File info */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
                          {(imageFile!.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-500/90 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </div>
                      </div>
                    </div>

                    {/* Change image button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.12] text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Change image
                    </button>
                  </div>
                ) : (
                  /* Upload drop zone */
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={cn(
                        'w-full rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-4 cursor-pointer group',
                        'py-12 px-6',
                        dragOver
                          ? 'border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/20 scale-[1.01]'
                          : 'border-slate-200 dark:border-white/[0.1] hover:border-brand-400 dark:hover:border-brand-600 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        'h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-200',
                        dragOver
                          ? 'bg-brand-100 dark:bg-brand-950/60 scale-110'
                          : 'bg-slate-100 dark:bg-white/[0.06] group-hover:bg-brand-100 dark:group-hover:bg-brand-950/40 group-hover:scale-105'
                      )}>
                        <ImagePlus className={cn(
                          'h-8 w-8 transition-colors duration-200',
                          dragOver
                            ? 'text-brand-500'
                            : 'text-slate-400 group-hover:text-brand-500'
                        )} />
                      </div>

                      <div className="text-center">
                        <p className={cn(
                          'text-sm font-bold transition-colors duration-200',
                          dragOver ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                        )}>
                          {dragOver ? 'Drop your image here' : 'Upload a product photo'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                          Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          JPEG · PNG · WebP · Max 5 MB
                        </p>
                      </div>

                      <div className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm',
                        dragOver
                          ? 'bg-brand-500 text-white'
                          : 'bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/30 group-hover:border-brand-300 dark:group-hover:border-brand-700 group-hover:text-brand-700 dark:group-hover:text-brand-300'
                      )}>
                        <Upload className="h-4 w-4" />
                        Choose file
                      </div>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              {/* Tips */}
              <div className="px-5 pb-5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Photo tips</p>
                {[
                  'Use a clear, well-lit photo of the product',
                  'White or neutral backgrounds work best',
                  'Show the front of the product clearly',
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Community note */}
            <div className="mt-4 rounded-xl border border-slate-200/60 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] p-4 flex gap-3 shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-700 dark:text-slate-300">Help the community.</span>{' '}
                Adding detailed descriptions and clear photos helps other shoppers make better decisions.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
