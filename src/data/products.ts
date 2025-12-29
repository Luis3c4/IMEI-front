export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const iPhoneProducts: Product[] = [
  // iPhone 16 Series
  { id: "iphone-16", name: "iPhone 16", price: 799, category: "iPhone 16" },
  { id: "iphone-16-plus", name: "iPhone 16 Plus", price: 899, category: "iPhone 16" },
  { id: "iphone-16-pro", name: "iPhone 16 Pro", price: 999, category: "iPhone 16" },
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", price: 1199, category: "iPhone 16" },
  
  // iPhone 15 Series
  { id: "iphone-15", name: "iPhone 15", price: 699, category: "iPhone 15" },
  { id: "iphone-15-plus", name: "iPhone 15 Plus", price: 799, category: "iPhone 15" },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", price: 899, category: "iPhone 15" },
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", price: 1099, category: "iPhone 15" },
  
  // iPhone 14 Series
  { id: "iphone-14", name: "iPhone 14", price: 599, category: "iPhone 14" },
  { id: "iphone-14-plus", name: "iPhone 14 Plus", price: 699, category: "iPhone 14" },
  
  // iPhone SE
  { id: "iphone-se", name: "iPhone SE (3rd Gen)", price: 429, category: "iPhone SE" },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};
