// app/admin/productsadmin/page.tsx
'use client';

import { useState, useEffect } from "react";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import "@uploadcare/react-uploader";
import { getAllMenuItemsAdmin, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/api';

type Product = {
  id: number;
  name: string;
  price: string;
  category: string;
  image_url: string;
  description?: string;
  available?: boolean;
  food_partner?: string;
};

export default function ProductsAdmin() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    const [formData, setFormData] = useState({ 
      name: "", 
      price: "", 
      category: "", 
      image_url: "",
      description: "",
      food_partner: "",
      available: true 
    });

    const foodPartners = [
      "Theatery Food Hub", "Potato Corner", "Chowking", "SpotG", 
      "Julies Bake Shop", "Waffle Time", "Takoyaki", "Shawarma", 
      "Buko Bar", "Juice Hub", "Other"
    ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllMenuItemsAdmin();
      if (response.items) {
        setProducts(response.items);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.image_url || !formData.food_partner) {
      alert("Please fill in all required fields (name, price, category, food partner, image).");
      return;
    }

    try {
      if (editingProduct) {
        const response = await updateMenuItem(editingProduct.id, {
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: formData.image_url,
          description: formData.description || '',
          food_partner: formData.food_partner,
          available: formData.available
        });
        
        if (response.item) {
          alert('Product updated successfully!');
          await loadProducts();
        }
      } else {
        const response = await createMenuItem({
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: formData.image_url,
          description: formData.description || '',
          food_partner: formData.food_partner,
          available: formData.available
        });
        
        if (response.item) {
          alert('Product added successfully!');
          await loadProducts();
        }
      }

      setEditingProduct(null);
      setFormData({ name: "", price: "", category: "", image_url: "", description: "", food_partner: "", available: true });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      description: product.description || '',
      food_partner: product.food_partner || '',
      available: product.available ?? true
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
      if (!confirm("Are you sure you want to delete this product?")) {
        return;
      }

      try {
        await deleteMenuItem(id);
        alert('Product deleted successfully!');
        await loadProducts();
      } catch (error: any) {
        console.error('Detailed delete error:', error);
        
        if (error.message && error.message.includes("Mark as unavailable")) {
           alert("⚠️ CANNOT DELETE: This item has previous orders.\n\nSOLUTION: Click 'Edit' and uncheck the 'Product is Available' box to hide it from the menu instead.");
        } else {
           alert('Failed to delete product. See console for details.');
        }
      }
    };

  const handleUpload = (e: any) => {
    console.log('Upload event:', e);
    
    // The event structure from Uploadcare
    const fileInfo = e.detail || e;
    console.log('File info:', fileInfo);
    
    // Try to extract CDN URL from various possible locations
    let cdnUrl = null;
    
    // Check all possible paths where the URL might be
    if (fileInfo?.cdnUrl) {
      cdnUrl = fileInfo.cdnUrl;
    } else if (fileInfo?.successEntries?.[0]?.cdnUrl) {
      cdnUrl = fileInfo.successEntries[0].cdnUrl;
    } else if (fileInfo?.allEntries?.[0]?.cdnUrl) {
      cdnUrl = fileInfo.allEntries[0].cdnUrl;
    } else if (fileInfo?.file?.cdnUrl) {
      cdnUrl = fileInfo.file.cdnUrl;
    }
    
    console.log('Extracted CDN URL:', cdnUrl);
    
    if (cdnUrl) {
      setFormData(prev => ({ ...prev, image_url: cdnUrl }));
      console.log('Image URL updated successfully');
    } else {
      console.error('Failed to extract CDN URL. Full event:', e);
      alert('Failed to get image URL. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="text-xl text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Products Management</h1>
              <p className="text-gray-600 mt-1">Add, edit, and manage your menu items</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-transparent rounded-full"></div>
        </div>
        
        {/* Form for Add/Edit */}
        <div className="mb-8 p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            {editingProduct && (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                Editing Mode
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Cheeseburger Combo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-2 border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>
            
            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₱) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="border-2 border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="border-2 border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                >
                  <option value="">Select Category</option>
                  <option value="Meals">🍽️ Meals</option>
                  <option value="Drinks">🥤 Drinks</option>
                  <option value="Desserts">🍰 Desserts</option>
                </select>
              </div>
            </div>

            {/* Food Partner */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Food Partner <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.food_partner}
                onChange={(e) => setFormData({ ...formData, food_partner: e.target.value })}
                className="border-2 border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              >
                <option value="">Select Food Partner</option>
                {foodPartners.map((partner) => (
                  <option key={partner} value={partner}>
                    {partner}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <textarea
                placeholder="Brief description of the product..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-2 border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                rows={3}
              />
            </div>
            
            {/* Availability Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-6 h-6 text-red-600 rounded focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="available" className="font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-2">
                <span>Product is Available</span>
                <span className="text-xs text-gray-500">(Show on customer menu)</span>
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Image <span className="text-red-600">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:border-red-400 transition">
                <FileUploaderRegular
                  pubkey="60b65262e57242452cae" 
                  sourceList="local, url, camera"
                  classNameUploader="uc-light"
                  onChange={handleUpload}
                  imgOnly={true}
                  multiple={false}
                  maxLocalFileSizeBytes={5242880}
                />
              </div>
              
              {formData.image_url && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm font-semibold text-green-800 mb-3">✅ Image uploaded successfully!</p>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-40 h-40 object-cover rounded-lg border-2 border-green-300 shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-red-600 transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              
              {editingProduct && (
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({ name: "", price: "", category: "", image_url: "", description: "", food_partner: "", available: true });
                  }}
                  className="flex-1 sm:flex-none border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                {products.length} {products.length === 1 ? 'Product' : 'Products'}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 text-left font-bold text-gray-700 text-sm">Image</th>
                  <th className="p-4 text-left font-bold text-gray-700 text-sm">Product</th>
                  <th className="p-4 text-left font-bold text-gray-700 text-sm">Status</th>
                  <th className="p-4 text-left font-bold text-gray-700 text-sm">Partner</th>
                  <th className="p-4 text-left font-bold text-gray-700 text-sm">Price</th>
                  <th className="p-4 text-left font-bold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No products found</p>
                        <p className="text-gray-400 text-sm mt-1">Add your first product using the form above!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-red-50/50 transition-colors ${!product.available ? 'bg-gray-50/50' : ''}`}
                    >
                      <td className="p-4">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className={`w-20 h-20 object-cover rounded-xl border-2 border-gray-200 shadow-sm ${!product.available ? 'opacity-50 grayscale' : ''}`}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{product.category}</div>
                      </td>
                      <td className="p-4">
                        {product.available ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-medium">{product.food_partner || 'N/A'}</td>
                      <td className="p-4 text-lg font-black text-red-600">₱{product.price}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-yellow-500 text-white px-5 py-2.5 rounded-xl hover:bg-yellow-600 transition-all text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}