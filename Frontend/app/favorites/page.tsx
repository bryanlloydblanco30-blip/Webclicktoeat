'use client'
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link";
import { getFavorites, removeFavorite } from "../services/api";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
};

export default function Favorites(){
    const [search, setSearch] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const response = await getFavorites();
            
            if (response.favorites) {
                const items = response.favorites.map((fav: any) => fav.menu_item);
                setMenuItems(items);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFoods = menuItems.filter((food) => {
        const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || food.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))];

    const handleRemoveFavorite = async (id: number) => {
        try {
            await removeFavorite(id);
            setMenuItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="text-center py-12">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-4"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent absolute top-0 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <p className="text-xl text-gray-600 font-medium">Loading favorites...</p>
                </div>
            </main>
        );
    }

    return(
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <Image src="/heart.png" height={24} width={24} alt="favorites icon" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900">My Favorites</h1>
                            <p className="text-gray-600 mt-1">Your saved items</p>
                        </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-transparent rounded-full"></div>
                </div>

                {/* Search and Filters */}
                <section className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Categories */}
                        <div className="flex text-gray-700 flex-wrap gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-6 py-2.5 cursor-pointer rounded-full transition-all duration-200 font-medium ${
                                        activeCategory === category
                                            ? "bg-red-600 text-white shadow-lg shadow-red-200 font-bold scale-105"
                                            : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-105 border border-gray-200"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full lg:w-96">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search favorites..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition"
                            />
                        </div>
                    </div>
                </section>

                {/* Food Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredFoods.length > 0 ? (
                        filteredFoods.map((food) => (
                            <div key={food.id} className="relative group">
                                <Link href={`/chosen_food?id=${food.id}`}>
                                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                                        {/* Image Container - Fixed Aspect Ratio */}
                                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                                            <img
                                                src={food.image_url}
                                                alt={food.name}
                                                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><span class="text-gray-400 text-5xl">🍽️</span></div>';
                                                    }
                                                }}
                                            />
                                            
                                            {/* Gradient Overlay on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                                            
                                            {/* Hover Text */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition duration-500 z-10 p-4">
                                                <span className="text-2xl text-center">{food.name}</span>
                                                <span className="text-lg text-red-400 mt-2">₱{parseFloat(food.price).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{food.name}</h3>
                                            
                                            {food.description && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{food.description}</p>
                                            )}
                                            
                                            {/* Price and Category Row */}
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                                <span className="text-red-600 font-black text-xl">₱{parseFloat(food.price).toFixed(2)}</span>
                                                <span className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-full font-semibold border border-red-100">
                                                    {food.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                
                                {/* Remove Heart Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemoveFavorite(food.id);
                                    }}
                                    className="absolute top-3 right-3 z-20 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group/btn hover:scale-110"
                                    title="Remove from favorites"
                                >
                                    <svg 
                                        className="w-5 h-5 text-red-600 group-hover/btn:scale-110 transition-transform" 
                                        fill="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                                <div className="max-w-md mx-auto">
                                    {/* Empty State Icon */}
                                    <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    
                                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                        {search ? "No matches found" : "No favorites yet"}
                                    </h2>
                                    <p className="text-gray-500 mb-8">
                                        {search 
                                            ? "Try adjusting your search or category filter" 
                                            : "Start adding items to your favorites and they'll appear here!"
                                        }
                                    </p>
                                    
                                    {!search && (
                                        <Link 
                                            href="/" 
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg hover:shadow-xl"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Browse Menu
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Footer */}
                {filteredFoods.length > 0 && (
                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border border-gray-200">
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-semibold text-gray-700">
                                {filteredFoods.length} favorite {filteredFoods.length === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}