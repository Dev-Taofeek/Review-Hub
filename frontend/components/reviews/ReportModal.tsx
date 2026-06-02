'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { reportsApi } from '@/lib/api';
import { REPORT_REASONS } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Review } from '@/types';

interface ReportModalProps {
  review: Review | null;
  onClose: () => void;
}

export function ReportModal({ review, onClose }: ReportModalProps) {
  const [reason,  setReason]  = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { toast.error('Please select a reason'); return; }
    if (!review) return;
    setLoading(true);
    try {
      await reportsApi.create(review.id, { reason, message: message.trim() || undefined });
      toast.success('Report submitted. Thank you for keeping the community safe.');
      setReason('');
      setMessage('');
      onClose();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={!!review}
      onClose={onClose}
      title="Report Review"
      description="Help us keep reviews trustworthy by reporting problematic content."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Reason" required
          options={REPORT_REASONS}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Select a reason"
        />
        <Textarea
          label="Additional details"
          placeholder="Optional: provide more context about your report"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
        />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="danger" loading={loading}>Submit Report</Button>
        </div>
      </form>
    </Modal>
  );
}
