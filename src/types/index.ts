export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  strain?: string;
  stockQuantity: number;
  imageUrls: string[];
  isActive?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  customerEmail: string;
  customerName: string;
  shippingAddress: Address;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  items: CartItem[];
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
