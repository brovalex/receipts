'use client';

import { useState } from 'react';
import { Modal, Button, Label, TextInput, Textarea } from 'flowbite-react';

interface CreateTaxYearModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (year: number, notes?: string) => Promise<void>;
  existingYears: number[];
}

export function CreateTaxYearModal({
  show,
  onClose,
  onSubmit,
  existingYears,
}: CreateTaxYearModalProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (existingYears.includes(year)) {
      setError(`Tax year ${year} already exists`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(year, notes || undefined);
      setYear(currentYear);
      setNotes('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tax year');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Create New Tax Year</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="year" value="Year" />
            <TextInput
              id="year"
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="notes" value="Notes (optional)" />
            <Textarea
              id="notes"
              placeholder="Any notes about this tax year..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Tax Year'}
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
