import { prisma } from '@/lib/prisma';

const Home = async () => {
  const receipts = await prisma.receipt.findMany({
    include: {
      expenses: true,
    },
  });

  return (
    <div className="p-4 flex flex-col gap-y-4">
      <h2>Receipts</h2>

      <ul className="flex flex-col gap-y-2">
        {receipts.map((receipt) => (
          <li key={receipt.id}>
            <a href={`/receipt/${receipt.id}`}>
              ID: {receipt.id}, Date: {receipt.receiptDate ? receipt.receiptDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}, Number of Expenses: {receipt.expenses.length}
            </a>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default Home;