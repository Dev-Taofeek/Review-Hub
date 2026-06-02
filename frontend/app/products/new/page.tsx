'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, Info, ImagePlus, X, Upload, Loader2 } from 'lucide-react';
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

  const [submitting, setSubmitting] = useState(false);
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name:        '',
    brand:       '',
    description: '',
    category_id: '',
    price:       '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const update = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only JPEG, PNG or WebP allowed'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())
      e.name = 'Product name is required — use the full official name (e.g. "Sony WH-1000XM5")';
    else if (form.name.trim().length < 3)
      e.name = 'Name must be at least 3 characters';

    if (!form.brand.trim())
      e.brand = 'Brand is required — enter the manufacturer or company (e.g. "Apple", "Nike", "Samsung")';

    if (!form.description.trim())
      e.description = 'Description is required — describe what the product is and what it does';
    else if (form.description.trim().length < 20)
      e.description = `Description too short — add at least ${20 - form.description.trim().length} more characters to describe the product properly`;

    if (!form.price)
      e.price = 'Price is required — enter the approximate retail price in USD';
    else if (isNaN(parseFloat(form.price)))
      e.price = 'Enter a valid price (e.g. 29.99)';
    else if (parseFloat(form.price) < 0)
      e.price = 'Price cannot be negative';

    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = Object.values(e)[0];
      toast.error(first!, { duration: 4000 });
    }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedPrice = parseFloat(form.price);
    if (isNaN(parsedPrice)) {
      toast.error('Please enter a valid price');
      return;
    }

    setSubmitting(true);
    try {
      const categoryId = form.category_id && form.category_id.trim() !== '' ? form.category_id : undefined;
      const res = await productsApi.create({
        name:        form.name.trim(),
        brand:       form.brand.trim(),
        description: form.description.trim(),
        ...(categoryId ? { category_id: categoryId } : {}),
        price:       parsedPrice,
      });

      const product = res.data!;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          await uploadsApi.uploadProductImage(product.id, imageFile, true);
        } catch {
          toast('Product created but image upload failed. You can add images later.', { icon: '⚠️' });
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
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10">

        {/* Back */}
        <nav className="mb-6">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-brand-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add a Product</h1>
              <p className="text-sm text-gray-500">Fill in the details below</p>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 px-4 py-3 flex gap-3 mb-6">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Products you add are visible to the whole community. After adding, you'll be taken to the product page to write your review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Image <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {imagePreview ? (
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-brand-200 dark:border-brand-800 bg-gray-100 dark:bg-white/5" style={{ aspectRatio: '16/9' }}>
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-gray-900/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-gray-900/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {(imageFile!.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'w-full rounded-2xl border-2 border-dashed transition-all duration-200',
                  'border-gray-200 dark:border-white/10 hover:border-brand-400 dark:hover:border-brand-600',
                  'bg-gray-50 dark:bg-white/5 hover:bg-brand-50/50 dark:hover:bg-brand-950/10',
                  'flex flex-col items-center justify-center gap-3 py-10'
                )}
              >
                <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload product image</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG or WebP · Max 5MB</p>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-xs">
                  <Upload className="h-3.5 w-3.5" /> Choose file
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Product name */}
          <Input
            label="Product Name"
            required
            placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
            hint='Use the full official product name — e.g. "Apple AirPods Pro (2nd Gen)"'
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
              hint="Approximate current retail price — enter 0 if free"
            />
          </div>

          {/* Description */}
          <Textarea
            label="Product Description"
            required
            rows={5}
            placeholder={`Describe this product in detail:\n• What does it do?\n• Who is it for?\n• What are its main features?\n\nExample: "The Sony WH-1000XM5 are over-ear wireless headphones with industry-leading active noise cancellation, 30-hour battery life, and multipoint Bluetooth connection."`}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            error={errors.description}
            hint={
              form.description.length < 20
                ? `${20 - form.description.length} more characters needed — describe what the product does`
                : `${form.description.length} / 5000 characters`
            }
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
            <Link href="/products">
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
            <Button
              type="submit"
              loading={submitting}
              icon={uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            >
              {submitting
                ? uploadingImage ? 'Uploading image…' : 'Creating product…'
                : 'Add Product & Write Review'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
