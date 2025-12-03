'use client'

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrder, getCart, checkAuth, cancelOrder } from "../../services/api";
import { useToast } from "../../components/Toast";

type PaymentMethod = {
  id: number;
  name: string;
  img: string;
  qr?: string;
  number?: string;
  accountName?: string;
}

const paymentMethods: PaymentMethod[] = [
    {id: 0, name: 'Cash payment', img: '/payment-method/payment-method.png'},
    {id: 1, name: 'gcash', img: '/payment-method/gcash.png', qr: '/gcash-qr.jpg', number: '09563975208', accountName: 'John Doe'},
    {id: 2, name: 'paymaya', img: '/payment-method/maya.png', qr: '/maya-qr.png', number: '09876543213', accountName: 'Jane Smith'}
]

type CartItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  subtotal: string;
  image_url: string;
  category: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [tip, setTip] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cancelTimeLeft, setCancelTimeLeft] = useState(60);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    setPickupTime(now.toISOString().slice(0, 16));

    checkAuthAndLoadCheckout();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (orderPlaced && cancelTimeLeft > 0) {
      timer = setInterval(() => {
        setCancelTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (cancelTimeLeft === 0) {
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [orderPlaced, cancelTimeLeft, router]);

  const checkAuthAndLoadCheckout = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Starting checkout auth check...');
      const authData = await checkAuth();
      console.log('✅ Auth response:', authData);
      
      if (authData && authData.authenticated === true) {
        console.log('✅ User authenticated:', authData.user);
        setIsAuthenticated(true);
        await loadCheckoutItems();
      } else {
        console.log('❌ User not authenticated');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Checkout auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckoutItems = async () => {
    try {
      const storedItemIds = sessionStorage.getItem('checkout_item_ids');
      
      if (!storedItemIds) {
        setLoading(false);
        return;
      }

      const itemIds = JSON.parse(storedItemIds) as number[];
      const cartData = await getCart();
      const selectedCartItems = cartData.cart.filter((item: CartItem) => itemIds.includes(item.id));
      
      setSelectedItems(selectedCartItems);
    } catch (error) {
      console.error('Error loading checkout items:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  
  const total = selectedItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  const handleConfirmOrder = async () => {
    if (!selectedPayment) {
      showToast("Please select a payment method", "red");
      return;
    }
    if (!pickupTime) {
      showToast("Please set pickup time", "red");
      return;
    }

    setIsSubmitting(true);

    try {
      const userStr = localStorage.getItem('user');
      let customerName = 'Guest';
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          customerName = user.full_name || user.username || 'Guest';
        } catch (error) {
          console.error('Error parsing user:', error);
        }
      }

      const response = await createOrder({
        payment_method: selectedPayment,
        tip: tip,
        pickup_time: pickupTime,
        customer_name: customerName
      });

      if (response.success) {
        setOrderId(response.order_id);
        setOrderPlaced(true);
        sessionStorage.removeItem('checkout_item_ids');
        window.dispatchEvent(new Event('cartUpdated'));
        showToast(`Order #${response.order_id} submitted successfully! You have 1 minute to cancel.`, "green");
      }
    } catch (error) {
      console.error('Order submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to submit order: ${errorMessage}`, "red");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (): Promise<void> => {
    if (!orderId) return;

    try {
      const response = await cancelOrder(orderId);
      if (response.success) {
        showToast("Order canceled successfully.", "green");
        setOrderPlaced(false);
        router.push('/');
      } else {
        showToast("Failed to cancel order.", "red");
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      showToast("Failed to cancel order.", "red");
    }
  };

  const handleCancel = () => {
    router.push('/mycart');
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen p-6">
        <div className="flex items-center mb-6">
          <Image src="/shopping-cart.png" height={30} width={30} alt="shopping cart icon" />
          <h1 className="ml-3 text-xl md:text-2xl font-semibold">Checkout</h1>
        </div>

        <div className="flex flex-col justify-center items-center h-96 text-center">
          <div className="text-gray-300 mb-4">
            <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Please Log In</h2>
          <p className="text-gray-500 mb-6">You need to log in to checkout</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen p-6">
        <div className="flex items-center mb-4">
          <Image src="/check-circle.png" height={30} width={30} alt="check icon" />
          <h1 className="ml-3 text-xl md:text-2xl font-semibold">Order Confirmed</h1>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Order #{orderId} has been placed!</h2>
          <p className="text-gray-600 mb-4">You can cancel this order within the next {cancelTimeLeft} seconds.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleCancelOrder()}
              disabled={cancelTimeLeft === 0}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Order ({cancelTimeLeft}s)
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center mb-4">
        <Image src="/shopping-cart.png" height={30} width={30} alt="shopping cart icon" />
        <h1 className="ml-3 text-xl md:text-2xl font-semibold">Checkout</h1>
      </div>

      {selectedItems.length === 0 ? (
        <section className="flex flex-col items-center">
          <Image src="/empty-cart.png" width={200} height={200} alt="Empty Cart" />
          <h2 className="text-xl font-semibold mt-4 text-gray-600">No items selected for checkout</h2>
          <Link href="/mycart" className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Back to Cart
          </Link>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <h2 className="font-bold text-lg">Order Items</h2>
            {selectedItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                <div className="flex items-center gap-4">
                  <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-16 h-16 rounded-lg object-cover border" />
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-gray-600 text-sm">{item.quantity} x ₱{parseFloat(item.price).toFixed(2)}</p>
                  </div>
                </div>
                <p className="font-semibold text-red-600">₱{parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-bold text-lg mb-2">Payment Methods</p>
              <div className="grid gap-3">
                {paymentMethods.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => setSelectedPayment(item.name)}
                      className={`flex items-center gap-3 w-full p-3 border rounded-lg transition ${
                        selectedPayment === item.name ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Image src={item.img} alt={item.name} width={40} height={30} className="object-contain" />
                      <h3 className={selectedPayment === item.name ? 'text-red-600 font-semibold' : ''}>{item.name}</h3>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-2">Tip</h2>
              <div className="flex gap-3 mb-2">
                {[5, 10, 20].map(amount => (
                  <button
                    key={amount}
                    className={`px-4 py-2 border rounded-lg transition ${
                      tip === amount ? "border-red-600 bg-red-50 text-red-600" : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setTip(amount)}
                  >
                    ₱{amount}.00
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom Tip"
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                value={tip || ""}
                min={0}
                onChange={(e) => setTip(Number(e.target.value))}
                onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h1 className="font-semibold text-lg">Time of Pickup</h1>
            <input
              type="datetime-local"
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Subtotal: ₱{total.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Tip: ₱{tip.toFixed(2)}</p>
              <p className="font-bold text-xl text-red-600 mt-1">Total: ₱{(total + tip).toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}