'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import Image from "next/image";

// Dynamically import charts with no SSR
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

type SalesByDay = {
  name: string;
  sales: number;
};

type OrdersByStatus = {
  name: string;
  value: number;
};

type Stats = {
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
  totalOrders: number;
  salesToday: number;
  topProduct: string;
  salesByDay: SalesByDay[];
  ordersByStatus: OrdersByStatus[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clicktoeat-pw67.onrender.com';

import { getAllOrders } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
    totalOrders: 0,
    salesToday: 0,
    topProduct: "Loading...",
    salesByDay: [],
    ordersByStatus: []
  });
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Get user from localStorage (if exists)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching dashboard data...');
      const data = await getAllOrders();
      const orders = data.orders || [];
      
      console.log(`✅ Loaded ${orders.length} orders`);
      
      const pending = orders.filter((o: any) => o.status === 'pending').length;
      const confirmed = orders.filter((o: any) => o.status === 'confirmed').length;
      const preparing = orders.filter((o: any) => o.status === 'preparing').length;
      const ready = orders.filter((o: any) => o.status === 'ready').length;
      const completed = orders.filter((o: any) => o.status === 'completed').length;
      const cancelled = orders.filter((o: any) => o.status === 'cancelled').length;
      
      const salesByDay = calculateSalesByDay(orders);
      
      const today = new Date().toISOString().split('T')[0];
      const todaysOrders = orders.filter((o: any) => o.pickup_date === today);
      const salesToday = todaysOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total), 0);
      
      const topProduct = findTopProduct(orders);
      
      const ordersByStatus = [
        { name: "Pending", value: pending },
        { name: "Confirmed", value: confirmed },
        { name: "Preparing", value: preparing },
        { name: "Ready", value: ready },
        { name: "Completed", value: completed },
        { name: "Cancelled", value: cancelled }
      ].filter(item => item.value > 0);

      setStats({
        pending,
        confirmed,
        preparing,
        ready,
        completed,
        cancelled,
        totalOrders: orders.length,
        salesToday,
        topProduct,
        salesByDay,
        ordersByStatus
      });
      
      setLoading(false);
      setError(null);
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const calculateSalesByDay = (orders: any[]): SalesByDay[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesMap: { [key: string]: number } = {};
    
    days.forEach(day => salesMap[day] = 0);
    
    orders.forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      const dayName = days[orderDate.getDay()];
      salesMap[dayName] += parseFloat(order.total);
    });
    
    return days.map(day => ({
      name: day,
      sales: parseFloat(salesMap[day].toFixed(2))
    }));
  };

  const findTopProduct = (orders: any[]): string => {
    const productCount: { [key: string]: number } = {};
    
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
      });
    });
    
    let topProduct = "No orders yet";
    let maxCount = 0;
    
    Object.entries(productCount).forEach(([name, count]: [string, any]) => {
      if (count > maxCount) {
        maxCount = count;
        topProduct = name;
      }
    });
    
    return topProduct;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <p className="text-red-600 font-semibold text-lg mb-2">Error Loading Dashboard</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="flex items-center mb-8">
        <Image src="/grid.png" height={32} width={32} alt="dashboard icon" />
        <h1 className="ml-3 text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-700">Pending Orders</h3>
              <div className="p-2 bg-red-50 rounded-lg">
                <Clock className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-700">Completed</h3>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-700">Total Orders</h3>
              <div className="p-2 bg-red-50 rounded-lg">
                <Users className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Sales Over Time</h3>
          {isClient ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => `₱${value}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#ff6b6b" 
                    strokeWidth={2}
                    dot={{ fill: '#ff6b6b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">Loading chart...</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Orders Breakdown</h3>
          {isClient ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">Loading chart...</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Total Sales Today</h3>
          <p className="text-4xl font-bold text-gray-900">₱{stats.salesToday.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Top Product</h3>
          <p className="text-2xl font-semibold text-gray-900 break-words">{stats.topProduct}</p>
        </div>
      </div>
    </main>
  );
}