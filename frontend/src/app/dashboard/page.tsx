'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from 'flowbite-react';
import { HiDocumentText, HiCurrencyDollar, HiCalendar, HiCheckCircle } from 'react-icons/hi';
import { MainLayout } from '@/components/layout';
import { FullPageLoading, FullPageError } from '@/components/ui';
import { TaxYearWithSummary } from '@/types/models';
import Link from 'next/link';

interface DashboardStats {
  totalReceipts: number;
  totalExpenses: number;
  totalAmount: number;
  currentYearAmount: number;
  openYears: number;
  closedYears: number;
}

export default function DashboardPage() {
  const [taxYears, setTaxYears] = useState<TaxYearWithSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/tax-years');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch data');
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
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <MainLayout>
        <FullPageLoading message="Loading dashboard..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <FullPageError message={error} onRetry={fetchData} />
      </MainLayout>
    );
  }

  const currentYear = new Date().getFullYear();
  const currentYearData = taxYears.find((ty) => ty.year === currentYear);

  const stats: DashboardStats = {
    totalReceipts: taxYears.reduce((sum, ty) => sum + ty.summary.receiptCount, 0),
    totalExpenses: taxYears.reduce((sum, ty) => sum + ty.summary.expenseCount, 0),
    totalAmount: taxYears.reduce((sum, ty) => sum + ty.summary.totalAmount, 0),
    currentYearAmount: currentYearData?.summary.totalAmount || 0,
    openYears: taxYears.filter((ty) => ty.status === 'OPEN').length,
    closedYears: taxYears.filter((ty) => ty.status === 'CLOSED').length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <HiDocumentText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Receipts</p>
                <p className="text-2xl font-bold">{stats.totalReceipts}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <HiCurrencyDollar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Claimed</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <HiCalendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{currentYear} Claims</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.currentYearAmount)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <HiCheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Years Closed</p>
                <p className="text-2xl font-bold">{stats.closedYears} / {taxYears.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Year by Year Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Year-by-Year Summary</h2>
          {taxYears.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-4">
                No tax years yet.{' '}
                <Link href="/settings/tax-years" className="text-blue-600 hover:underline">
                  Create your first tax year
                </Link>
                .
              </p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Year</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Receipts</th>
                    <th className="px-6 py-3">Expenses</th>
                    <th className="px-6 py-3">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {taxYears.map((ty) => (
                    <tr key={ty.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {ty.year}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            ty.status === 'OPEN'
                              ? 'bg-green-100 text-green-800'
                              : ty.status === 'CLOSED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ty.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{ty.summary.receiptCount}</td>
                      <td className="px-6 py-4">{ty.summary.expenseCount}</td>
                      <td className="px-6 py-4 font-medium text-green-600">
                        {formatCurrency(ty.summary.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-gray-100">
                    <td className="px-6 py-3">Total</td>
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3">{stats.totalReceipts}</td>
                    <td className="px-6 py-3">{stats.totalExpenses}</td>
                    <td className="px-6 py-3 text-green-600">
                      {formatCurrency(stats.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Receipts
            </Link>
            <Link
              href="/settings/tax-years"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Manage Tax Years
            </Link>
            <Link
              href="/admin/price-proofs"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Price Proofs
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
