import { useState, useEffect } from 'react';
import axios from 'axios';

// Format INR without conversion
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newOrder, setNewOrder] = useState({
    tableNumber: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    paymentStatus: 'pending',
    paymentMethod: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://restaurant-billing-system-backend.vercel.app/api/orders');
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('https://restaurant-billing-system-backend.vercel.app/api/menu');
      setMenuItems(response.data);
    } catch (err) {
      setError('Failed to fetch menu items');
    }
  };

  const addItemToOrder = (menuItem) => {
    const existingItem = newOrder.items.find(
      (item) => item.menuItem._id === menuItem._id
    );

    if (existingItem) {
      const updatedItems = newOrder.items.map((item) =>
        item.menuItem._id === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      updateOrderTotals(updatedItems);
    } else {
      const updatedItems = [
        ...newOrder.items,
        { menuItem, quantity: 1, price: menuItem.price }
      ];
      updateOrderTotals(updatedItems);
    }
  };

  const updateOrderTotals = (items) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    setNewOrder({
      ...newOrder,
      items,
      subtotal,
      tax,
      total
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the order data
      const orderData = {
        tableNumber: parseInt(newOrder.tableNumber),
        items: newOrder.items.map(item => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          price: item.price // Price is already in INR
        })),
        subtotal: newOrder.subtotal,
        tax: newOrder.tax,
        total: newOrder.total,
        status: 'pending',
        paymentStatus: 'pending'
      };

      await axios.post('https://restaurant-billing-system-backend.vercel.app/api/orders', orderData);
      
      // Reset form
      setNewOrder({
        tableNumber: '',
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        paymentStatus: 'pending',
        paymentMethod: ''
      });
      
      // Refresh orders list
      fetchOrders();
    } catch (err) {
      console.error('Failed to create order:', err);
      setError(err.response?.data?.message || 'Failed to create order');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`https://restaurant-billing-system-backend.vercel.app/api/orders/${orderId}/status`, {
        status
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const handlePayment = async (orderId, paymentMethod) => {
    try {
      await axios.patch(`https://restaurant-billing-system-backend.vercel.app/api/orders/${orderId}/payment`, {
        paymentStatus: 'paid',
        paymentMethod
      });
      setShowPayment(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      setError('Failed to process payment');
    }
  };

  const openPayment = (order) => {
    setSelectedOrder(order);
    setShowPayment(true);
  };

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
          {error}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Create New Order */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Number
                </label>
                <input
                  type="number"
                  value={newOrder.tableNumber}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, tableNumber: e.target.value })
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                  required
                />
              </div>

              {/* Menu Items Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Items</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {menuItems && menuItems.map((item) => (
                    item && (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => addItemToOrder(item)}
                        className="group p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all duration-200 text-left"
                      >
                        <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatINR(item.price)}
                        </div>
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full capitalize"
                          style={{
                            backgroundColor: 
                              item.category === 'appetizer' ? '#FEF3C7' :
                              item.category === 'main' ? '#DBEAFE' :
                              item.category === 'dessert' ? '#FCE7F3' :
                              '#E0E7FF',
                            color:
                              item.category === 'appetizer' ? '#92400E' :
                              item.category === 'main' ? '#1E40AF' :
                              item.category === 'dessert' ? '#9D174D' :
                              '#3730A3'
                          }}
                        >
                          {item.category}
                        </span>
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-4">
                  {!newOrder.items || newOrder.items.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No items added to order</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {newOrder.items.map((item, index) => (
                          item && item.menuItem && (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">
                                  {item.menuItem.name}
                                </span>
                                <span className="text-gray-500 mx-2">×</span>
                                <span className="text-gray-600">{item.quantity}</span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {formatINR(item.price * item.quantity)}
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatINR(newOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Tax (10%)</span>
                          <span>{formatINR(newOrder.tax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span>{formatINR(newOrder.total)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!newOrder.items || newOrder.items.length === 0}
              className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Order
            </button>
          </form>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Active Orders</h2>
          </div>
          <div className="p-6">
            {!orders || orders.filter((order) => order && order.status !== 'completed').length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No active orders</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders
                  .filter((order) => order && order.status !== 'completed')
                  .map((order) => (
                    order && (
                      <div
                        key={order._id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Table {order.tableNumber}
                              </h3>
                              <div className="flex space-x-2 mt-2">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  order.paymentStatus === 'pending' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {order.paymentStatus === 'pending' ? 'Unpaid' : 'Paid'}
                                </span>
                              </div>
                              <div className="mt-4 space-y-2">
                                {order.items && order.items.map((item, index) => (
                                  item && item.menuItem && (
                                    <div key={index} className="text-sm text-gray-600">
                                      {item.menuItem.name} × {item.quantity}
                                    </div>
                                  )
                                ))}
                              </div>
                              <div className="mt-4 text-lg font-semibold text-gray-900">
                                Total: {formatINR(order.total)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              {order.status === 'served' && order.paymentStatus === 'pending' ? (
                                <button
                                  onClick={() => openPayment(order)}
                                  className="block px-3 py-1 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors duration-200"
                                >
                                  Process Payment
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => updateOrderStatus(order._id, 'preparing')}
                                    className={`block px-3 py-1 rounded-lg text-sm font-medium ${
                                      order.status === 'pending'
                                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        : 'bg-gray-50 text-gray-400'
                                    } transition-colors duration-200`}
                                    disabled={order.status !== 'pending'}
                                  >
                                    Preparing
                                  </button>
                                  <button
                                    onClick={() => updateOrderStatus(order._id, 'served')}
                                    className={`block px-3 py-1 rounded-lg text-sm font-medium ${
                                      order.status === 'preparing'
                                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                        : 'bg-gray-50 text-gray-400'
                                    } transition-colors duration-200`}
                                    disabled={order.status !== 'preparing'}
                                  >
                                    Served
                                  </button>
                                </>
                              )}
                              {order.paymentStatus === 'paid' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'completed')}
                                  className={`block px-3 py-1 rounded-lg text-sm font-medium ${
                                    order.status === 'served'
                                      ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                      : 'bg-gray-50 text-gray-400'
                                  } transition-colors duration-200`}
                                  disabled={order.status !== 'served'}
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Process Payment</h3>
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Table {selectedOrder.tableNumber}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatINR(selectedOrder.total)}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handlePayment(selectedOrder._id, 'cash')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Pay with Cash
                </button>
                <button
                  onClick={() => handlePayment(selectedOrder._id, 'card')}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Pay with Card
                </button>
                <button
                  onClick={() => handlePayment(selectedOrder._id, 'upi')}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Pay with UPI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders; 