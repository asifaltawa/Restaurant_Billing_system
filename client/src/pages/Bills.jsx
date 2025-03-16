import { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';

function Bills() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axios.get('http://localhost:5000/api/orders');
      console.log('Orders received:', response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      setLoading(false);
    }
  };

  const handlePayment = async (orderId, paymentMethod) => {
    try {
      setPaymentLoading(true);
      console.log('Processing payment...', { orderId, paymentMethod });
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/payment`, {
        paymentStatus: 'paid',
        paymentMethod
      });
      await fetchOrders();
      setShowPaymentModal(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const openPaymentModal = (order) => {
    console.log('Opening payment modal for order:', order);
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    if (selectedOrder) {
      await handlePayment(selectedOrder._id, 'card');
    }
  };

  const generateBill = async (orderId) => {
    try {
      console.log('Generating bill...', orderId);
      const response = await axios.get(
        `http://localhost:5000/api/bills/order/${orderId}`,
        {
          responseType: 'blob', // Important for handling PDF
        }
      );
      
      // Create a blob URL from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open PDF in a new tab
      window.open(url, '_blank');
      
      // Clean up the blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
      
    } catch (err) {
      console.error('Bill generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate bill');
    }
  };

  // Log the state when it changes
  useEffect(() => {
    console.log('Bills component state:', {
      hasOrders: orders.length > 0,
      unpaidOrders: orders.filter(o => o.status === 'served' && o.paymentStatus === 'pending').length,
      showingPaymentModal: showPaymentModal,
      selectedOrder: selectedOrder ? {
        id: selectedOrder._id,
        total: selectedOrder.total,
        status: selectedOrder.status
      } : null
    });
  }, [orders, showPaymentModal, selectedOrder]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
        <div className="text-red-600 mb-4">
          <svg className="w-8 h-8 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Error: {error}
        </div>
        <button 
          onClick={fetchOrders}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const unpaidOrders = orders.filter(
    (order) => order.status === 'served' && order.paymentStatus === 'pending'
  );

  const paidOrders = orders.filter((order) => order.paymentStatus === 'paid');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Bills Management</h1>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Unpaid Bills */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Unpaid Bills</h2>
          </div>
          <div className="p-6">
            {unpaidOrders.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No unpaid bills</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unpaidOrders.map((order) => (
                  order && (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Table {order.tableNumber}</h3>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            Unpaid
                          </span>
                        </div>
                        <div className="space-y-2">
                          {order.items && order.items.map((item, index) => (
                            item && item.menuItem && (
                              <div key={index} className="flex justify-between text-sm text-gray-600">
                                <span>{item.menuItem.name} × {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            )
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>Tax</span>
                            <span>${order.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-gray-900 mt-2">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handlePayment(order._id, 'cash')}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? 'Processing...' : 'Pay Cash'}
                          </button>
                          <button
                            onClick={() => openPaymentModal(order)}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? 'Processing...' : 'Pay with Card'}
                          </button>
                          <button
                            onClick={() => generateBill(order._id)}
                            className="col-span-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                            disabled={paymentLoading}
                          >
                            Print Bill
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Paid Bills */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Paid Bills</h2>
          </div>
          <div className="p-6">
            {paidOrders.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No paid bills</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paidOrders.map((order) => (
                  order && (
                    <div
                      key={order._id}
                      className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Table {order.tableNumber}</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Paid - {order.paymentMethod}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.updatedAt).toLocaleString()}
                        </div>
                        <div className="mt-3 text-lg font-semibold text-gray-900">
                          Total: ${order.total.toFixed(2)}
                        </div>
                        <button
                          onClick={() => generateBill(order._id)}
                          className="mt-4 w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                          Print Bill
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            console.log('Closing payment modal');
            setShowPaymentModal(false);
            setSelectedOrder(null);
          }}
          amount={selectedOrder?.total || 0}
          orderId={selectedOrder?._id}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default Bills; 