'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getMenuItems, getFavoriteIds, addFavorite, removeFavorite } from "../services/api";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
};

export default function Mainpage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentPromo, setCurrentPromo] = useState(0);

  // Featured/Daily Specials - you can make this dynamic from API
  const featuredItems = menuItems.slice(0, 3);
  
  const promos = [
    {
      title: "Student Meal Deal",
      description: "Get 20% off on combo meals!",
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Weekend Special",
      description: "Buy 2 Get 1 Free on selected items",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Happy Hour",
      description: "15% off drinks from 2-4 PM",
      color: "from-blue-500 to-cyan-600"
    }
  ];

  useEffect(() => {
    loadMenuItems();
    loadFavorites();
  }, []);

  // Auto-rotate promos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getMenuItems();
      if (response.items) {
        setMenuItems(response.items);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await getFavoriteIds();
      if (response.favorite_ids) {
        setFavorites(response.favorite_ids);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (id: number) => {
    try {
      if (favorites.includes(id)) {
        await removeFavorite(id);
        setFavorites(favorites.filter(fav => fav !== id));
      } else {
        await addFavorite(id);
        setFavorites([...favorites, id]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredFoods = menuItems.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || food.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))];

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Image src="/shopping-bag.png" height={30} width={30} alt="shopping bag" />
        <h1 className="ml-3 text-xl font-semibold">Order Now!</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Menu Items */}
        <div className="flex-1">
          {/* Search Bar - Now at top */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-red focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex text-gray-700 flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 cursor-pointer rounded-full transition-all duration-200 font-medium ${
                  activeCategory === category
                    ? "bg-main-red text-white shadow-lg shadow-red-200 font-bold scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md hover:scale-105"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <div key={food.id} className="relative">
                  <Link href={`/chosen_food?id=${food.id}`}>
                    <div className="relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-white hover:shadow-2xl transition-shadow duration-300">
                      <div className="relative w-full h-64">
                        <img
                          src={food.image_url}
                          alt={food.name}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-400 text-4xl">🍽️</span></div>';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition duration-500 z-10">
                          <span className="text-2xl text-center px-4">{food.name}</span>
                          <span className="text-lg text-main-red mt-2">₱{parseFloat(food.price).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-800 truncate">{food.name}</h3>
                        {food.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{food.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-main-red font-bold text-lg">₱{parseFloat(food.price).toFixed(2)}</span>
                          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                            {food.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(food.id);
                    }}
                    className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                    title={favorites.includes(food.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg 
                      className={`w-6 h-6 transition ${favorites.includes(food.id) ? 'text-main-red' : 'text-gray-400'}`} 
                      fill={favorites.includes(food.id) ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No food found.</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>

          {filteredFoods.length > 0 && (
            <div className="text-center mt-8 text-gray-600">
              Showing {filteredFoods.length} of {menuItems.length} items
            </div>
          )}
        </div>

        {/* Right Side - Featured & Promos */}
        <div className="lg:w-80 xl:w-96 space-y-6">
          {/* Promo Slider */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-48">
              <div className={`absolute inset-0 bg-gradient-to-br ${promos[currentPromo].color} flex flex-col items-center justify-center p-6 transition-all duration-500`}>
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">{promos[currentPromo].title}</h3>
                  <p className="text-lg">{promos[currentPromo].description}</p>
                </div>
              </div>
              {/* Promo dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {promos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPromo(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      currentPromo === index ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Daily Specials */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">⭐</span>
              <h2 className="text-xl font-bold text-gray-800">Today's Specials</h2>
            </div>
            <div className="space-y-4">
              {featuredItems.map((item) => (
                <Link key={item.id} href={`/chosen_food?id=${item.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer border border-gray-100">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dy=".3em"%3E🍽️%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-main-red font-bold">₱{parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-main-red to-red-700 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-3">Menu Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-bold">{menuItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Categories:</span>
                <span className="font-bold">{categories.length - 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Favorites:</span>
                <span className="font-bold">{favorites.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(../school.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(5px)',
            opacity: 0.15
          }}
        />
      </div>
    </section>
  );
}