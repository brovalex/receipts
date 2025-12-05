'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Alert } from 'flowbite-react';
import { HiPlus } from 'react-icons/hi';
import { MainLayout } from '@/components/layout';
import { FullPageLoading, FullPageError } from '@/components/ui';
import { TaxYearCard, CreateTaxYearModal } from '@/components/tax-year';
import { TaxYearWithSummary } from '@/types/models';

export default function TaxYearsSettingsPage() {
  const [taxYears, setTaxYears] = useState<TaxYearWithSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTaxYears = useCallback(async () => {
    try {
      const response = await fetch('/api/tax-years');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch tax years');
      }

      setTaxYears(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaxYears();
  }, [fetchTaxYears]);

  const handleCreateTaxYear = async (year: number, notes?: string) => {
    const response = await fetch('/api/tax-years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, notes }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create tax year');
    }

    setSuccessMessage(`Tax year ${year} created successfully`);
    setTimeout(() => setSuccessMessage(null), 3000);
    await fetchTaxYears();
  };

  const handleCloseTaxYear = async (taxYear: TaxYearWithSummary) => {
    if (!confirm(`Are you sure you want to close tax year ${taxYear.year}? You won't be able to modify receipts in this year until you reopen it.`)) {
      return;
    }

    setActionLoading(taxYear.id);
    try {
      const response = await fetch(`/api/tax-years/${taxYear.id}/close`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to close tax year');
      }

      setSuccessMessage(`Tax year ${taxYear.year} closed successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchTaxYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopenTaxYear = async (taxYear: TaxYearWithSummary) => {
    if (!confirm(`Are you sure you want to reopen tax year ${taxYear.year}?`)) {
      return;
    }

    setActionLoading(taxYear.id);
    try {
      const response = await fetch(`/api/tax-years/${taxYear.id}/reopen`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to reopen tax year');
      }

      setSuccessMessage(`Tax year ${taxYear.year} reopened successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchTaxYears();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <FullPageLoading message="Loading tax years..." />
      </MainLayout>
    );
  }

  if (error && taxYears.length === 0) {
    return (
      <MainLayout>
        <FullPageError message={error} onRetry={fetchTaxYears} />
      </MainLayout>
    );
  }

  const existingYears = taxYears.map((ty) => ty.year);

  return (
    <MainLayout>
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax Years</h1>
            <p className="text-gray-600">
              Manage your tax years. Close a year when you&apos;ve filed your taxes to prevent accidental changes.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <HiPlus className="mr-2 h-5 w-5" />
            New Tax Year
          </Button>
        </div>

        {successMessage && (
          <Alert color="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        {taxYears.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No tax years yet.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <HiPlus className="mr-2 h-5 w-5" />
              Create Your First Tax Year
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taxYears.map((taxYear) => (
              <TaxYearCard
                key={taxYear.id}
                taxYear={taxYear}
                onClose={() => handleCloseTaxYear(taxYear)}
                onReopen={() => handleReopenTaxYear(taxYear)}
                isLoading={actionLoading === taxYear.id}
              />
            ))}
          </div>
        )}

        <CreateTaxYearModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTaxYear}
          existingYears={existingYears}
        />
      </div>
    </MainLayout>
  );
}
