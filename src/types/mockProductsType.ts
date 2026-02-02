export interface ProductItem {
  serial: string;
  productNumber: string;
  capacity: string;
  color: string;
  colorHex: string;
}

export interface CapacityGroup {
  id: number;
  capacity: string;
  quantity: number;
  colors: { name: string; hex: string }[];
  items: ProductItem[];
}

export interface Product {
  id: number;
  name: string;
  totalQuantity: number;
  capacities: string[];
  colors: { name: string; hex: string }[];
  lastUpdate: string;
  capacityGroups: CapacityGroup[];
}
