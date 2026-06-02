'use client';

import { useState } from 'react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { productsApi } from '@/lib/api';
import { useCategories } from '@/hooks/useProducts';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

interface ProductFormProps {
  product?: Product;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:        product?.name        ?? '',
    description: product?.description ?? '',
    brand:       product?.brand       ?? '',
    category_id: product?.category_id ?? '',
    price:       String(product?.price ?? ''),
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.brand || !form.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), category_id: form.category_id || undefined };
      let result: Product;
      if (product) {
        const res = await productsApi.update(product.id, payload);
        result = res.data!;
        toast.success('Product updated');
      } else {
        const res = await productsApi.create(payload);
        result = res.data!;
        toast.success('Product created');
      }
      onSuccess(result);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Product Name" required
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
      />
      <Textarea
        label="Description" required
        rows={4}
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Brand" required
          value={form.brand}
          onChange={(e) => update('brand', e.target.value)}
        />
        <Input
          label="Price (USD)" type="number" min="0" step="0.01" required
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
        />
      </div>
      <Select
        label="Category"
        options={[{ value: '', label: 'No category' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
        value={form.category_id}
        onChange={(e) => update('category_id', e.target.value)}
      />
      <div className="flex gap-3 justify-end mt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
