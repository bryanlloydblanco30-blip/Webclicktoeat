'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  food_partner: string;
}

// ==================== API CONFIGURATION ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clicktoeat-pw67.onrender.com';

// ==================== SESSION MANAGEMENT ====================
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

// ==================== API FUNCTIONS ====================
async function getPartnerMenuItems(partnerName: string) {
  const encodedName = encodeURIComponent(partnerName);
  console.log('🔍 Fetching from:', `${API_BASE_URL}/api/partners/${encodedName}/menu/`);
  
  const response = await fetch(`${API_BASE_URL}/api/partners/${encodedName}/menu/`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

async function addToCart(menuItemId: number, quantity: number) {
  const sessionId = getSessionId();
  
  console.log('🛒 Adding to cart:', { menuItemId, quantity, sessionId });
  
  const response = await fetch(`${API_BASE_URL}/api/cart/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menu_item_id: menuItemId,
      quantity,
      session_id: sessionId
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Add to cart error:', errorText);
    throw new Error('Failed to add to cart');
  }
  
  return response.json();
}

export default function PartnerDetailClient() {
  const router = useRouter();
  const params = useParams();
  
  // Extract partner name from params
  const rawPartnerName = params?.partnerName;
  const partnerName = Array.isArray(rawPartnerName) 
    ? rawPartnerName[0] 
    : rawPartnerName;
  
  console.log('🎯 Partner Detail Page');
  console.log('Raw params:', params);
  console.log('Partner name:', partnerName);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load partner items
  useEffect(() => {
    if (!partnerName || partnerName === 'undefined') {
      setError('Invalid partner name');
      setLoading(false);
      return;
    }
    
    loadPartnerItems();
  }, [partnerName]);

  const loadPartnerItems = async () => {
    if (!partnerName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const displayName = decodeURIComponent(partnerName);
      console.log('📡 Loading items for:', displayName);
      
      const data = await getPartnerMenuItems(displayName);
      console.log('✅ API Response:', data);
      
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
        if (data.items.length === 0) {
          setError(`No items available for ${displayName} right now`);
        }
      } else {
        console.error('Invalid response structure:', data);
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('❌ Error loading items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: MenuItem) => {
    try {
      setAddingToCart(item.id);
      console.log('Adding item to cart:', item);
      
      await addToCart(item.id, 1);
      
      setToastMessage(`${item.name} added!`);
      setShowToast(true);
      
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => loadPartnerItems()}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/partners')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Back to Partners
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading menu...</p>
          <p className="text-gray-400 text-sm mt-2">{partnerName ? decodeURIComponent(partnerName) : ''}</p>
        </div>
      </div>
    );
  }

  const displayName = partnerName ? decodeURIComponent(partnerName) : '';
  const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <>
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
      
      <main className="min-h-screen bg-gray-50 p-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]">
                <div className="bg-white rounded-full p-2 flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">Added to Cart!</p>
                  <p className="text-sm text-green-50">{toastMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition group"
            >
              <div className="bg-white rounded-full p-2 shadow-md group-hover:shadow-lg transition mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium">Back</span>
            </button>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-red-100 rounded-xl p-3">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      {items.length} items available
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-red-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items in this category</h3>
              <p className="text-gray-600">Try selecting a different category</p>
            </div>
          )}

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <div 
                  onClick={() => router.push(`/chosen-food?id=${item.id}`)}
                  className="cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1 group-hover:text-red-600 transition">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-red-600">₱{item.price}</span>
                      {item.category && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={addingToCart === item.id}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg active:scale-95"
                  >
                    {addingToCart === item.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}