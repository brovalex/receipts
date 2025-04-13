'use client';

import { useState, useEffect } from 'react';
import { Receipt } from '@prisma/client';

interface ReceiptWithRelations extends Receipt {
  expenses: any[];  // Replace 'any' with proper type if available
}

export default function Home() {
  const [receipts, setReceipts] = useState<ReceiptWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  
  useEffect(() => {
    async function fetchReceipts() {
      try {
        const response = await fetch('/api/receipts');
        const data = await response.json();
        setReceipts(data);
        
        // Set to most recent year after loading data
        const years = Array.from(new Set(
          data
            .filter(receipt => receipt.receiptDate)
            .map(receipt => new Date(receipt.receiptDate).getFullYear())
        ));
        if (years.length > 0) {
          setSelectedYear(Math.max(...years).toString());
        }
      } catch (error) {
        console.error('Error fetching receipts:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReceipts();
  }, []);
  
  // Get unique years from receipts
  const years = ['all', ...Array.from(new Set(
    receipts
      .filter(receipt => receipt.receiptDate)
      .map(receipt => new Date(receipt.receiptDate).getFullYear())
      .sort((a, b) => b - a)
  ))];
  
  // Find the most recent year (if any years exist)
  const mostRecentYear = years.filter(y => y !== 'all').length > 0 
    ? Math.max(...years.filter(y => y !== 'all').map(y => Number(y)))
    : 'all';
  
  // Filter receipts based on selected year
  const filteredReceipts = selectedYear === 'all' 
    ? receipts 
    : receipts.filter(receipt => 
        receipt.receiptDate && 
        new Date(receipt.receiptDate).getFullYear() === parseInt(selectedYear)
      );
  
  if (loading) return <div className="p-4">Loading receipts...</div>;
  
  return (
    <div className="p-4 flex flex-col gap-y-4">
      <h2 className="text-2xl font-bold max-w-4xl mx-auto">Receipts</h2>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <label htmlFor="year-filter" className="text-sm font-medium text-gray-700">
            Filter by year:
          </label>
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {years.map(year => (
              <option 
                key={year} 
                value={year} 
                selected={typeof year === 'number' && year === Math.max(...years.filter(y => typeof y === 'number'))}
              >
                {year === 'all' ? 'All Years' : year}
              </option>
            ))}
          </select>
        </div>
        
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReceipts.map((receipt) => (
              <tr key={receipt.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {receipt.receiptDate 
                    ? new Date(receipt.receiptDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) 
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.expenses.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.reviewed ? 'Reviewed' : 'Not Reviewed'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <a href={`/receipt/${receipt.id}`} className="text-blue-600 hover:text-blue-900">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}