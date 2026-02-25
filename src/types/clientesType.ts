// ============= Types =============
export interface Customer {
  id: number;
  name?: string;
  dni?: string;
  phone?: string;
  created_at?: string;
  first_name?: string;
  first_last_name?: string;
  second_last_name?: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  total: number;
  error?: string;
}