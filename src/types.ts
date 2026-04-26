export interface Product {
  id: string | number;
  item_name: string;
  category: string;
  category_name?: string;
  price: number;
  cutprice: number;
  discount_percentage: number;
  image: string;
  star: number;
  description?: string;
  short_description?: string;
  sku?: string;
  quantity?: number;
  min_stock_level?: number;
  unit?: string;
  specifications?: { [key: string]: string };
  reviews?: { user: string; rating: number; comment: string; date: string }[];
  images?: string[];
}

export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface CartItem extends Product {
  quantity: number;
}
