import { prisma } from '@/lib/prisma';

const Home = async () => {
  const receipts = await prisma.receipt.findMany({
    include: {
      expenses: true,
    },
  });

  return (
    <div className="p-4 flex flex-col gap-y-4">
      <h2 className="text-2xl font-bold max-w-4xl mx-auto">Receipts</h2>

      <table className="max-w-4xl mx-auto divide-y divide-gray-200">
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
          {receipts.map((receipt) => (
            <tr key={receipt.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.receiptDate ? receipt.receiptDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</td>
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
  );
};

export default Home;