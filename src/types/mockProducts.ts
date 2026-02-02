import type { Product } from "@/types/mockProductsType";

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 17",
    totalQuantity: 20,
    capacities: ["256GB", "516GB"],
    colors: [
      { name: "Naranja", hex: "#FF6B00" },
      { name: "Verde", hex: "#22C55E" },
      { name: "Rosa", hex: "#EC4899" },
      { name: "Azul", hex: "#3B82F6" },
    ],
    lastUpdate: "29 de enero",
    capacityGroups: [
      {
        id: 1,
        capacity: "256GB",
        quantity: 10,
        colors: [
          { name: "Azul", hex: "#3B82F6" },
          { name: "Verde", hex: "#22C55E" },
        ],
        items: [
          { serial: "AB12CD34EF", productNumber: "MQ1A2LL/A", capacity: "256GB", color: "Azul", colorHex: "#3B82F6" },
          { serial: "GH56IJ78KL", productNumber: "MQ1B3LL/A", capacity: "256GB", color: "Azul", colorHex: "#3B82F6" },
          { serial: "MN90OP12QR", productNumber: "MQ1C4LL/A", capacity: "256GB", color: "Verde", colorHex: "#22C55E" },
          { serial: "ST34UV56WX", productNumber: "MQ1D5LL/A", capacity: "256GB", color: "Verde", colorHex: "#22C55E" },
        ],
      },
      {
        id: 2,
        capacity: "516GB",
        quantity: 10,
        colors: [
          { name: "Naranja", hex: "#FF6B00" },
          { name: "Rosa", hex: "#EC4899" },
        ],
        items: [
          { serial: "MN4DF2G06C", productNumber: "MX2D3AM/A", capacity: "516GB", color: "Naranja", colorHex: "#FF6B00" },
          { serial: "D5WQ0F96X0", productNumber: "MG7K4LL/A", capacity: "516GB", color: "Verde", colorHex: "#22C55E" },
          { serial: "J0CR79166L", productNumber: "MFXM4LL/A", capacity: "516GB", color: "Rosa", colorHex: "#EC4899" },
          { serial: "HWFK40036N", productNumber: "MCX04LL/A", capacity: "516GB", color: "Azul", colorHex: "#3B82F6" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "AirPods Pro 3",
    totalQuantity: 15,
    capacities: ["256GB", "516GB"],
    colors: [
      { name: "Naranja", hex: "#FF6B00" },
      { name: "Verde", hex: "#22C55E" },
      { name: "Rosa", hex: "#EC4899" },
    ],
    lastUpdate: "10 de enero",
    capacityGroups: [
      {
        id: 1,
        capacity: "256GB",
        quantity: 8,
        colors: [
          { name: "Naranja", hex: "#FF6B00" },
          { name: "Verde", hex: "#22C55E" },
        ],
        items: [
          { serial: "AP1234567A", productNumber: "MTJV3AM/A", capacity: "256GB", color: "Naranja", colorHex: "#FF6B00" },
          { serial: "AP7654321B", productNumber: "MTJV4AM/A", capacity: "256GB", color: "Verde", colorHex: "#22C55E" },
        ],
      },
      {
        id: 2,
        capacity: "516GB",
        quantity: 7,
        colors: [
          { name: "Rosa", hex: "#EC4899" },
        ],
        items: [
          { serial: "AP9876543C", productNumber: "MTJV5AM/A", capacity: "516GB", color: "Rosa", colorHex: "#EC4899" },
        ],
      },
    ],
  },
];
