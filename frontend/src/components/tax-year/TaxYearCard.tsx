'use client';

import { Card, Badge, Button } from 'flowbite-react';
import { HiLockClosed, HiLockOpen, HiArchive } from 'react-icons/hi';
import { TaxYearWithSummary } from '@/types/models';

interface TaxYearCardProps {
  taxYear: TaxYearWithSummary;
  onClose?: () => void;
  onReopen?: () => void;
  isLoading?: boolean;
}

export function TaxYearCard({ taxYear, onClose, onReopen, isLoading }: TaxYearCardProps) {
  const statusColors = {
    OPEN: 'success',
    CLOSED: 'warning',
    ARCHIVED: 'gray',
  } as const;

  const statusIcons = {
    OPEN: <HiLockOpen className="h-4 w-4" />,
    CLOSED: <HiLockClosed className="h-4 w-4" />,
    ARCHIVED: <HiArchive className="h-4 w-4" />,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="max-w-sm">
      <div className="flex justify-between items-start">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {taxYear.year}
        </h5>
        <Badge color={statusColors[taxYear.status]} icon={() => statusIcons[taxYear.status]}>
          {taxYear.status}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Receipts:</span>
          <span className="font-medium">{taxYear.summary.receiptCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Expenses:</span>
          <span className="font-medium">{taxYear.summary.expenseCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Amount:</span>
          <span className="font-medium text-green-600">
            {formatCurrency(taxYear.summary.totalAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Date Range:</span>
          <span className="font-medium text-xs">
            {formatDate(taxYear.summary.dateRange.earliest)} -{' '}
            {formatDate(taxYear.summary.dateRange.latest)}
          </span>
        </div>
      </div>

      {taxYear.notes && (
        <p className="text-sm text-gray-500 italic border-t pt-2">
          {taxYear.notes}
        </p>
      )}

      <div className="flex gap-2">
        {taxYear.status === 'OPEN' && onClose && (
          <Button
            color="warning"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            <HiLockClosed className="mr-2 h-4 w-4" />
            Close Year
          </Button>
        )}
        {taxYear.status === 'CLOSED' && onReopen && (
          <Button
            color="light"
            size="sm"
            onClick={onReopen}
            disabled={isLoading}
          >
            <HiLockOpen className="mr-2 h-4 w-4" />
            Reopen
          </Button>
        )}
      </div>

      {taxYear.closedAt && (
        <p className="text-xs text-gray-400">
          Closed on {formatDate(taxYear.closedAt)}
        </p>
      )}
    </Card>
  );
}
