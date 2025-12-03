'use client';

import { useState, useEffect } from "react";

// Define types matching your Django response
type OrderItem = {
  name: string;
  quantity: number;
  price: string;
  subtotal: string;
  food_partner?: string;
};

type Order = {
  id: number;
  total: string;
  tip: string;
  payment_method: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
  created_at: string;
  customer_name?: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

// Mock API function - replace with your actual import
import { getAllOrders } from '../../services/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // Fetch Data on Load
  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      console.log('Admin orders received:', data);
      setOrders(data.orders || []); 
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      alert("Failed to load orders. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.status.toLowerCase() === filter.toLowerCase());

  // Helper for formatting
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Count orders by status
  const statusCounts = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = orders.filter(o => o.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div className="p-10 text-center">Loading Admin Dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">All Orders (Admin View)</h1>
              <p className="text-gray-600 mt-1">Monitor all orders - Status managed by partner staff</p>
            </div>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm flex items-center gap-2"
            >
              <span>🔄</span> Refresh
            </button>
          </div>

          {/* Status Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            {STATUS_OPTIONS.map((status) => (
              <div key={status} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-800">{statusCounts[status] || 0}</div>
                <div className="text-xs text-gray-600 capitalize">{status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", ...STATUS_OPTIONS].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all
                ${
                  filter === status
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-white text-gray-600 border hover:bg-gray-100"
                }`}
            >
              {status} {status === "All" ? `(${orders.length})` : statusCounts[status] > 0 ? `(${statusCounts[status]})` : ''}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Order ID</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Customer</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Date & Pickup</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Items</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Payment</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Total</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-gray-800">#{order.id}</span>
                      <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    
                    {/* ✅ CUSTOMER NAME COLUMN */}
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {order.customer_name || 'N/A'}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-700">
                        {new Date(order.pickup_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-red-600 font-semibold">
                        {formatTime(order.pickup_time)}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="flex flex-col gap-1">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-sm text-gray-600 truncate">
                            <span className="font-bold text-gray-800">{item.quantity}x</span> {item.name}
                            {item.food_partner && (
                              <span className="text-xs text-blue-600 ml-2">({item.food_partner})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize border">
                        {order.payment_method}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-gray-800">₱{parseFloat(order.total).toFixed(2)}</div>
                      {parseFloat(order.tip) > 0 && (
                        <span className="text-xs text-green-600">+₱{parseFloat(order.tip)} tip</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`
                        px-3 py-1.5 rounded-lg text-sm font-semibold border-2 capitalize inline-block
                        ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                        ${order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${order.status === 'preparing' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                        ${order.status === 'ready' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${order.status === 'completed' ? 'bg-gray-100 text-gray-600 border-gray-300' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No orders found for this filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}