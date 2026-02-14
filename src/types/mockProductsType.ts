export interface ProductItem {
  serial: string;
  productNumber: string;
  capacity: string | null;
  color: string;
  colorHex: string;
}

export interface CapacityGroup {
  id: number;
  capacity: string | null;
  quantity: number;
  colors: { name: string; hex: string }[];
  items: ProductItem[];
}

export interface Product {
  id: number;
  name: string;
  totalQuantity: number;
  capacities: (string | null)[];
  colors: { name: string; hex: string }[];
  lastUpdate: string;
  capacityGroups: CapacityGroup[];
}

export interface ProductHierarchyResponse {
  success: boolean;
  data: Product[];
  count: number;
  page: number;
  pageSize: number;
}
