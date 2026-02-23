export interface ProductVariant {
  name: string;
  colors: string[];
  capacities: string[];
}

export interface ProductCategory {
  category: string;
  products: ProductVariant[];
}

export const appleProducts: ProductCategory[] = [
  {
    category: "IPHONE",
    products: [
      { name: "iPhone 17", colors: ["Negro", "Blanco", "Verde", "Azul", "Rosa"], capacities: ["128GB", "256GB", "512GB"] },
      { name: "iPhone 17 Pro", colors: ["Titanio Natural", "Titanio Azul", "Titanio Blanco", "Titanio Negro"], capacities: ["256GB", "512GB", "1TB"] },
      { name: "iPhone 17 Pro Max", colors: ["Titanio Natural", "Titanio Azul", "Titanio Blanco", "Titanio Negro"], capacities: ["256GB", "512GB", "1TB"] },
    ],
  },
  {
    category: "IPAD",
    products: [
      { name: "iPad Pro 2026 (M6)", colors: ["Gris Espacial", "Plata"], capacities: ["256GB", "512GB", "1TB", "2TB"] },
    ],
  },
  {
    category: "MACBOOK",
    products: [
      { name: "MacBook Air (M5)", colors: ["Medianoche", "Luz Estelar", "Gris Espacial", "Plata"], capacities: ["256GB", "512GB", "1TB"] },
      { name: "MacBook Pro (M5)", colors: ["Gris Espacial", "Plata"], capacities: ["512GB", "1TB", "2TB"] },
      { name: "MacBook Pro (M6)", colors: ["Gris Espacial", "Plata"], capacities: ["512GB", "1TB", "2TB", "4TB"] },
    ],
  },
  {
    category: "IMAC",
    products: [
      { name: "iMac 2026 (M6)", colors: ["Azul", "Verde", "Rosa", "Plata", "Naranja", "Morado", "Amarillo"], capacities: ["256GB", "512GB", "1TB"] },
    ],
  },
  {
    category: "MAC MINI & MAC STUDIO",
    products: [
      { name: "Mac mini 2026", colors: ["Plata"], capacities: ["256GB", "512GB", "1TB", "2TB"] },
      { name: "Mac Studio 2026", colors: ["Plata"], capacities: ["512GB", "1TB", "2TB", "4TB", "8TB"] },
    ],
  },
  {
    category: "APPLE WATCH",
    products: [
      { name: "Apple Watch Series 12", colors: ["Medianoche", "Luz Estelar", "Plata", "Rosa", "(PRODUCT)RED"], capacities: ["40mm", "44mm"] },
      { name: "Apple Watch Ultra 3", colors: ["Titanio Natural", "Titanio Negro"], capacities: ["49mm"] },
    ],
  },
  {
    category: "AIRPODS",
    products: [
      { name: "AirPods 4", colors: ["Blanco"], capacities: ["Estándar", "Con ANC"] },
      { name: "AirPods Pro 3", colors: ["Blanco"], capacities: ["Estándar"] },
    ],
  },
  {
    category: "HOMEPOD",
    products: [
      { name: "HomePod", colors: ["Medianoche", "Blanco"], capacities: ["Estándar"] },
    ],
  },
  {
    category: "APPLE TV",
    products: [
      { name: "Apple TV 2026", colors: ["Negro"], capacities: ["64GB", "128GB"] },
    ],
  },
  {
    category: "AIRTAG",
    products: [
      { name: "AirTag 2.0", colors: ["Blanco"], capacities: ["Unidad", "Pack de 4"] },
    ],
  },
];
