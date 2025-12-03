// types/index.ts

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  food_partner: string;
  available?: boolean;
}

export interface CartItem {
  id: number;
  menu_item_id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  cart: CartItem[];
  total: string;
  item_count: number;
}

export interface Favorite {
  id: number;
  menu_item: MenuItem;
  created_at: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface Order {
  id: number;
  total: string;
  tip: string;
  payment_method: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

// types.ts or add to existing type file
export interface FoodPartner {
  name: string;
  image_url: string;
  item_count: number;
}