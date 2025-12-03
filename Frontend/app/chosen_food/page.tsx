'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getMenuItems, addToCart, checkAuth } from '../services/api';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  food_partner: string;
}

function ChosenFoodContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const showToast = (message: string, color: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${color};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  useEffect(() => {
    if (id) {
      loadMenuItem(id);
    }
  }, [id]);

  const loadMenuItem = async (itemId: string) => {
    try {
      setLoading(true);
      const data = await getMenuItems();
      const foundItem = data.items?.find((item: MenuItem) => item.id.toString() === itemId);
      
      if (foundItem) {
        setItem(foundItem);
      } else {
        console.error('Item not found');
      }
    } catch (error) {
      console.error('Error loading item:', error);
      alert('Failed to load food item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!item) return;
    
    try {
      const authData = await checkAuth();
      
      if (!authData.authenticated) {
        showToast('Please log in to add items to cart', "#ef4444");
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      setAddingToCart(true);
      await addToCart(item.id, quantity);
      window.dispatchEvent(new Event('cartUpdated'));
      
      setAddingToCart(false);
      showToast(`${quantity}x ${item.name} added to cart successfully!`, "#10b981");
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', "#ef4444");
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading food item...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Food item not found</p>
          <button 
            onClick={() => router.back()}
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const totalPrice = (parseFloat(item.price) * quantity).toFixed(2);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sticky Top Bar with Back Button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-700 hover:text-red-600 font-semibold transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Menu
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center text-sm text-gray-600">
          <button onClick={() => router.push('/')} className="hover:text-red-600 transition">Home</button>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-400">{item.category || 'Menu'}</span>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900">{item.name}</span>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Left Column - Image */}
          <div className="relative bg-gray-100">
            <div className="aspect-[4/3] relative">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="p-8 lg:p-12 flex flex-col">
            
            {/* Product Name */}
            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{item.name}</h1>
            
            {/* Food Partner */}
            {item.food_partner && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span className="text-sm font-medium">by {item.food_partner}</span>
              </div>
            )}

            {/* Price & Category */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div>
                <span className="text-5xl font-bold text-red-600">₱{item.price}</span>
              </div>
              {item.category && (
                <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-semibold border border-red-100">
                  {item.category}
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Spacer to push quantity and button to bottom */}
            <div className="flex-grow"></div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl flex items-center justify-center text-xl font-bold transition-all shadow-sm border border-gray-200"
                >
                  -
                </button>
                <span className="text-3xl font-bold w-16 text-center text-gray-900">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl flex items-center justify-center text-xl font-bold transition-all shadow-sm border border-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price Display */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Total Price</span>
                <span className="text-3xl font-bold text-red-600">₱{totalPrice}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full bg-red-600 text-white px-8 py-5 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Adding to Cart...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ChosenFoodPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <ChosenFoodContent />
    </Suspense>
  );
}