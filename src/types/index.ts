export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  strain?: string;
  stock_quantity: number;
  image_urls: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string; // Changed from number to string
  customerEmail: string;
  customerName?: string; // Made optional since it can be null
  shippingAddress: Address;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"; // Added "cancelled"
  items: CartItem[];
  createdAt: string;
}

export interface Address {
  name: string; // Added name field
  line1: string; // Changed from street to line1
  line2?: string; // Added optional line2
  city: string;
  state: string;
  postal_code: string; // Changed from zipCode to postal_code
  country: string;
}
