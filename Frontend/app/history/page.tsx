'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrders, checkAuth } from "../services/api";
import { motion } from "framer-motion";

type OrderItem = {
  name: string;
  quantity: number;
  price: string;
  subtotal: string;
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
  items: OrderItem[];
};

export default function HistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string>("");

  useEffect(() => {
    checkAuthAndFetchOrders();
  }, []);

  const checkAuthAndFetchOrders = async () => {
    try {
      setLoading(true);
      setAuthError("");
      
      // Check authentication
      const authData = await checkAuth();
      console.log('Auth check response:', authData);
      
      if (!authData || !authData.authenticated) {
        console.log('User not authenticated');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      console.log('User authenticated:', authData.user);
      setIsAuthenticated(true);
      
      // Fetch orders
      await fetchOrders();
    } catch (error: any) {
      console.error('Auth check error:', error);
      
      // Check if it's a 401/403 error (unauthorized)
      if (error.message?.includes('401') || error.message?.includes('403')) {
        setIsAuthenticated(false);
        setAuthError("Please log in to view your order history");
      } else {
        setIsAuthenticated(false);
        setAuthError("Failed to verify authentication. Please try logging in again.");
      }
      
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      console.log('Orders fetched:', data);
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      
      // If orders fetch fails with auth error, user is not authenticated
      if (error.message?.includes('401') || error.message?.includes('403')) {
        setIsAuthenticated(false);
        setAuthError("Session expired. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-4"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent absolute top-0 left-1/2 -translate-x-1/2"></div>
            </div>
            <p className="text-xl text-gray-600 font-medium">Loading order history...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center mb-6">
          <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-2xl font-semibold">Order History</h1>
        </div>

        <div className="flex flex-col justify-center items-center h-96 text-center">
          <div className="bg-red-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-2">{authError || "You need to log in to view your order history"}</p>
          <p className="text-sm text-gray-500 mb-6">Make sure cookies are enabled in your browser</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/login')}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-semibold shadow-lg"
            >
              Go to Login
            </button>
            <button
              onClick={() => checkAuthAndFetchOrders()}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center mb-6">
        <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h1 className="text-2xl font-semibold">Order History</h1>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              {/* Order Header */}
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="font-bold text-xl text-gray-900">Order #{order.id}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-red-600">₱{parseFloat(order.total).toFixed(2)}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-gray-600 flex-wrap mb-2">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <span>📅</span>
                    <span>Pickup: {formatDate(order.pickup_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <span>🕐</span>
                    <span>{formatTime(order.pickup_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <span>💳</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">{order.items.length} item(s)</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {expandedOrder === order.id ? 'Hide' : 'View'} details
                    <svg 
                      className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Order Items (Expandable) */}
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-base text-gray-800 mb-3">Order Items:</h3>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.quantity} x ₱{parseFloat(item.price).toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-red-600 text-lg">₱{parseFloat(item.subtotal).toFixed(2)}</p>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-300 space-y-2 bg-white rounded-lg p-4 mt-4">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-medium">₱{(parseFloat(order.total) - parseFloat(order.tip)).toFixed(2)}</span>
                      </div>
                      {parseFloat(order.tip) > 0 && (
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Tip:</span>
                          <span className="font-medium">₱{parseFloat(order.tip).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-red-600">₱{parseFloat(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-96 text-center">
          <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">No order history</h2>
          <p className="text-gray-500 mt-2 mb-6">Your past orders will appear here</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Browse Menu
          </button>
        </div>
      )}
    </div>
  );
}