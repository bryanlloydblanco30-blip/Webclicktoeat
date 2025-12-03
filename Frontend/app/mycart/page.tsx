'use client'

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCart, updateCartItem, removeFromCart, checkAuth } from "../services/api";

type CartItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  subtotal: string;
  image_url: string;
  category: string;
  menu_item_id: number;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchCart();
  }, []);

  const checkAuthAndFetchCart = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      console.log('🔍 Starting auth check...');
      const authData = await checkAuth();
      console.log('✅ Auth response:', authData);
      
      // Check if response has the expected structure
      if (authData && authData.authenticated === true) {
        console.log('✅ User authenticated:', authData.user);
        setIsAuthenticated(true);
        await fetchCart();
      } else {
        console.log('❌ User not authenticated. Response:', authData);
        setIsAuthenticated(false);
        setAuthError('Not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      console.log('🛒 Fetching cart...');
      const data = await getCart();
      console.log('✅ Cart fetched:', data);
      
      if (data && data.cart) {
        setCart(data.cart);
      } else {
        console.warn('⚠️ Unexpected cart response format:', data);
        setCart([]);
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      // If cart fetch fails due to auth, update auth state
      if (error instanceof Error && error.message.includes('401')) {
        setIsAuthenticated(false);
      }
    }
  };

  const handleCheckbox = (itemId: number) => {
    setCheckedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setCheckedItems([]);
    } else {
      setCheckedItems(cart.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    if (cart.length === 0) setSelectAll(false);
    else if (checkedItems.length === cart.length) setSelectAll(true);
    else setSelectAll(false);
  }, [checkedItems, cart]);

  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(item.id, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    try {
      await removeFromCart(item.id);
      await fetchCart();
      setCheckedItems(prev => prev.filter(id => id !== item.id));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const total = cart.reduce((sum, item) => {
    if (!checkedItems.includes(item.id)) return sum;
    return sum + parseFloat(item.subtotal);
  }, 0);

  const handleCheckout = () => {
    if (checkedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }
    
    console.log('Proceeding to checkout with item IDs:', checkedItems);
    sessionStorage.setItem('checkout_item_ids', JSON.stringify(checkedItems));
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
            <p className="text-xl text-gray-600 font-medium">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center mb-6">
          <Image src="/shopping-cart.png" height={30} width={30} alt="shopping cart icon" />
          <h1 className="ml-3 text-2xl font-semibold">Order Summary</h1>
        </div>

        <div className="flex flex-col justify-center items-center h-96 text-center">
          <div className="bg-red-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-2">You need to log in to view your cart</p>
          {authError && (
            <p className="text-sm text-red-600 mb-4">Debug: {authError}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/login')}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-semibold shadow-lg"
            >
              Go to Login
            </button>
            <button
              onClick={checkAuthAndFetchCart}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-6">
      <div className="flex items-center mb-6">
        <Image src="/shopping-cart.png" height={30} width={30} alt="shopping cart icon" />
        <h1 className="ml-3 text-2xl font-semibold">Order Summary</h1>
      </div>

      {cart.length > 0 ? (
        <div className="w-full space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 p-4 rounded-lg shadow-sm bg-white border border-gray-100 hover:shadow-md transition"
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-red-600 cursor-pointer flex-shrink-0"
                  checked={checkedItems.includes(item.id)}
                  onChange={() => handleCheckbox(item.id)}
                />

                <img
                  src={item.image_url || '/placeholder.png'}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover border flex-shrink-0"
                />

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="font-semibold text-lg truncate">{item.name}</h2>
                    <button 
                      onClick={() => handleRemoveItem(item)} 
                      className="cursor-pointer hover:opacity-70 flex-shrink-0 transition"
                    >
                      <Image src='/trash.png' alt='trash icon' width={24} height={24} />
                    </button>
                  </div>

                  <p className="text-gray-500 text-sm mb-3">{item.category}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.button
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 font-semibold"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        whileTap={{ scale: 0.9 }}
                      >
                        -
                      </motion.button>
                      <motion.span
                        key={item.quantity}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="font-bold w-8 text-center"
                      >
                        {item.quantity}
                      </motion.span>
                      <motion.button
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 font-semibold"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        whileTap={{ scale: 0.9 }}
                      >
                        +
                      </motion.button>
                    </div>

                    <h1 className="text-red-600 font-bold text-lg">₱{parseFloat(item.subtotal).toFixed(2)}</h1>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-96 text-center">
          <Image src="/empty-cart.png" width={200} height={200} alt="Empty Cart" />
          <h2 className="text-2xl font-semibold mt-4 text-gray-600">Your cart is empty</h2>
          <Link
            href="/"
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Back to Menu
          </Link>
        </div>
      )}

      {/* Bottom Checkout Bar */}
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-50 to-white shadow-2xl border-t-2 border-gray-200 z-50"
          >
            <div className="max-w-5xl mx-auto px-6 py-5">
              <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-6 w-6 accent-red-600 cursor-pointer rounded"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-red-600 transition">
                      Select All
                    </span>
                  </label>

                  <div className="h-8 w-px bg-gray-300"></div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <h2 className="text-3xl font-black text-red-600">₱{total.toFixed(2)}</h2>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/mycart/checkout">
                  <motion.button
                    className={`flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                      checkedItems.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-xl'
                    }`}
                    whileTap={checkedItems.length > 0 ? { scale: 0.95 } : {}}
                    onClick={handleCheckout}
                    disabled={checkedItems.length === 0}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Checkout ({checkedItems.length})</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
  
  );
}