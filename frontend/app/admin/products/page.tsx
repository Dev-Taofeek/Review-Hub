'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { productsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { products, totalPages, loading, refetch } = useProducts({ page });
  const [formOpen,      setFormOpen]      = useState(false);
  const [editProduct,   setEditProduct]   = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    try {
      await productsApi.delete(deleteProduct.id);
      toast.success('Product deleted');
      refetch();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); setDeleteProduct(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Products</h2>
        <Button icon={<Plus className="h-4 w-4" />} size="sm" onClick={() => { setEditProduct(null); setFormOpen(true); }}>
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="No products yet"
          description="Create your first product to get started."
          action={{ label: 'Add Product', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0D1020] shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-white/[0.06]">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  {['Product', 'Category', 'Price', 'Rating', 'Reviews', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04] bg-white dark:bg-[#0D1020]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.brand}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.category ? <Badge variant="info">{p.category.name}</Badge> : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-sm text-amber-500">{p.average_rating.toFixed(1)}★</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.total_reviews}</td>
                    <td className="px-4 py-3">
                      {p.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="xs" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />}
                          onClick={() => { setEditProduct(p); setFormOpen(true); }}>
                          Edit
                        </Button>
                        <Button size="xs" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />}
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteProduct(p)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null); }}
        title={editProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          product={editProduct ?? undefined}
          onCancel={() => { setFormOpen(false); setEditProduct(null); }}
          onSuccess={() => { setFormOpen(false); setEditProduct(null); refetch(); }}
        />
      </Modal>

      <ConfirmModal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Product"
        description={`This will remove "${deleteProduct?.name}" and cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
