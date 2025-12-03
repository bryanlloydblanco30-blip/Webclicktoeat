"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

interface Order {
  id: number;
  customer_name: string;  // ✅ Changed from 'name' to match backend
  item: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  rejectReason?: string;
  pickup_date?: string;  // ✅ Added
  pickup_time?: string;  // ✅ Added
}

function OwnerContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  useEffect(() => {
    const userParam = searchParams.get('user');
    
    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        if (user.role !== 'staff') {
          window.location.href = 'http://localhost:3000/login';
          return;
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        setUserInfo(user);
        loadOrders(user.food_partner);
      } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'http://localhost:3000/login';
      }
    } else {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        window.location.href = 'http://localhost:3000/login';
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        if (user.role !== 'staff') {
          window.location.href = 'http://localhost:3000/login';
          return;
        }

        setUserInfo(user);
        loadOrders(user.food_partner);
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'http://localhost:3000/login';
      }
    }
  }, [searchParams]);

  const loadOrders = async (foodPartner: string, attempt: number = 1) => {
    try {
      console.log(`🔍 Loading orders for: ${foodPartner} (Attempt ${attempt})`);
      
      const url = `https://clicktoeat-pw67.onrender.com/api/partner/orders/?partner=${encodeURIComponent(foodPartner)}`;
      console.log('📡 Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 503) {
        throw new Error('SERVICE_UNAVAILABLE');
      }
      
      if (!response.ok) {
        console.error('❌ Backend error:', response.status, response.statusText);
        throw new Error(`Backend returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Backend response:', data);
      
      if (!data.orders || data.orders.length === 0) {
        console.log('ℹ️ No orders found for this partner');
        setOrders([]);
        setLoading(false);
        setRetrying(false);
        return;
      }
      
      // ✅ Updated transformation to preserve customer_name
      const transformedOrders = data.orders.map((order: any) => ({
        id: order.id,
        customer_name: order.customer_name || 'Guest',  // ✅ Use customer_name from backend
        item: order.items.map((i: any) => i.name).join(', '),
        quantity: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
        totalPrice: parseFloat(order.total),
        status: order.status as OrderStatus,
        pickup_date: order.pickup_date,  // ✅ Added
        pickup_time: order.pickup_time   // ✅ Added
      }));
      
      console.log('✅ Transformed orders:', transformedOrders);
      setOrders(transformedOrders);
      setRetrying(false);
      setRetryCount(0);
    } catch (error: any) {
      console.error('❌ Error loading orders:', error);
      
      if (error.message === 'SERVICE_UNAVAILABLE' && attempt < 5) {
        setRetrying(true);
        setRetryCount(attempt);
        const delay = attempt * 3000;
        console.log(`⏳ Retrying in ${delay/1000} seconds...`);
        setTimeout(() => loadOrders(foodPartner, attempt + 1), delay);
      } else {
        alert('Failed to load orders. The server might be starting up. Please refresh in a moment.');
        setOrders([]);
        setRetrying(false);
      }
    } finally {
      if (!retrying) {
        setLoading(false);
      }
    }
  };

  const updateStatus = async (orderId: number, newStatus: OrderStatus, reason?: string) => {
    try {
      console.log(`🔄 Updating order #${orderId} to ${newStatus}`);
      
      const response = await fetch(`https://clicktoeat-pw67.onrender.com/api/partner/orders/${orderId}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Order #${orderId} updated:`, data);
        
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus, rejectReason: reason } : o
          )
        );
        
        if (userInfo?.food_partner) {
          await loadOrders(userInfo.food_partner);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const handleReject = (orderId: number) => {
    const reason = prompt(`Please enter the reason for cancelling Order #${orderId}:`);
    if (reason && reason.trim() !== "") {
      updateStatus(orderId, "cancelled", reason);
    } else {
      alert("Cancellation reason is required!");
    }
  };

  const handleLogout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('user');
    localStorage.removeItem('food_partner');
    localStorage.removeItem('cart_session_id');
    localStorage.removeItem('session_id');
    window.location.replace('http://localhost:3000/login');
  };

  // ✅ Helper function to format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const activeOrders = orders.filter(o => 
    o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready'
  );
  
  const historyOrders = orders.filter(o => 
    o.status === 'completed' || o.status === 'cancelled'
  );

  if (loading || retrying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-700 font-medium">
            {retrying ? `Server is waking up... (${retryCount}/5)` : 'Loading orders...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {retrying ? 'This may take up to 30 seconds' : 'Please wait'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Orders Dashboard</h1>
          {userInfo && (
            <p className="text-gray-600 mt-2">
              {userInfo.food_partner} • Staff: {userInfo.username}
            </p>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === "active"
              ? "bg-red-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === "history"
              ? "bg-red-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          History ({historyOrders.length})
        </button>
      </div>

      {/* Active Orders Grid */}
      {activeTab === "active" && (
        <>
          {activeOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No active orders</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white shadow-xl border rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-2xl font-semibold">Order #{order.id}</h2>
                  
                  {/* ✅ Customer Name with better styling */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Customer</p>
                    <p className="text-lg font-bold text-blue-900">{order.customer_name}</p>
                  </div>
                  
                  {/* ✅ Pickup Time if available */}
                  {order.pickup_time && (
                    <div className="bg-amber-50 p-2 rounded border border-amber-200">
                      <p className="text-xs text-amber-600">Pickup Time</p>
                      <p className="text-sm font-semibold text-amber-900">{formatTime(order.pickup_time)}</p>
                    </div>
                  )}
                  
                  <p className="text-lg"><strong>Items:</strong> {order.item}</p>
                  <p className="text-lg"><strong>Quantity:</strong> {order.quantity}</p>
                  <p className="text-lg font-semibold">Total: ₱{order.totalPrice.toFixed(2)}</p>
                  <p className="text-sm font-medium">
                    Status: <span className="text-orange-600 font-bold">{order.status.toUpperCase()}</span>
                  </p>

                  {order.status === "pending" && (
                    <div className="flex gap-3 pt-4">
                      <button
                        className="flex-1 border-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                        onClick={() => updateStatus(order.id, "confirmed")}
                      >
                        Accept
                      </button>
                      <button
                        className="flex-1 border-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                        onClick={() => handleReject(order.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {order.status === "confirmed" && (
                    <button
                      className="w-full border-2 flex-1 border-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                      onClick={() => updateStatus(order.id, "preparing")}
                    >
                      Start Preparing
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <div className="flex gap-3 pt-4">
                      <button
                        className="flex-1 border-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                        onClick={() => updateStatus(order.id, "ready")}
                      >
                        Ready for Pickup
                      </button>
                      <button
                        className="flex-1 border-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                        onClick={() => updateStatus(order.id, "cancelled")}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {order.status === "ready" && (
                    <button
                      className="w-full border-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                      onClick={() => updateStatus(order.id, "completed")}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* History Orders Grid */}
      {activeTab === "history" && (
        <>
          {historyOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No order history yet</p>
              <p className="text-gray-400 text-sm mt-2">Completed and cancelled orders will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white shadow-xl border rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-2xl font-semibold">Order #{order.id}</h2>
                  
                  {/* ✅ Customer Name */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Customer</p>
                    <p className="text-lg font-bold text-gray-900">{order.customer_name}</p>
                  </div>
                  
                  <p className="text-lg"><strong>Items:</strong> {order.item}</p>
                  <p className="text-lg"><strong>Quantity:</strong> {order.quantity}</p>
                  <p className="text-lg font-semibold">Total: ₱{order.totalPrice.toFixed(2)}</p>

                  {order.status === "completed" && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-600 font-semibold text-center">Completed</p>
                    </div>
                  )}

                  {order.status === "cancelled" && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-red-600 font-semibold">❌ Cancelled</p>
                      {order.rejectReason && (
                        <p className="text-sm text-gray-700 mt-2">
                          Reason: {order.rejectReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OwnerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
      <OwnerContent />
    </Suspense>
  );
}