import { useState, useEffect } from 'react';
import axios from 'axios';

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDailyReport();
  }, []);

  const fetchDailyReport = async () => {
    try {
      const response = await axios.get('https://restaurant-billing-system-backend.vercel.app/api/bills/daily-report');
      setReport(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch daily report');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!report) return <div>No report data available</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daily Sales Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {report.totalOrders}
          </p>
        </div>

        {/* Total Sales Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Total Sales</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            ${report.totalSales.toFixed(2)}
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Average Order Value</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            ${(report.totalSales / report.totalOrders || 0).toFixed(2)}
          </p>
        </div>

        {/* Date */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Date</h3>
          <p className="mt-2 text-xl text-gray-600">
            {new Date(report.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Cash Payments</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {report.paymentMethods.cash}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Card Payments</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {report.paymentMethods.card}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">UPI Payments</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {report.paymentMethods.upi}
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchDailyReport}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Refresh Report
        </button>
      </div>
    </div>
  );
}

export default Reports; 