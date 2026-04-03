export interface Expense {
  id: number;
  description: string;
  amount: string;
  category: 'RENT' | 'UTILITIES' | 'SUPPLIES' | 'MARKETING' | 'OTHER';
  subcategory: string;
  expenseDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MPESA' | 'AIRTELMONEY';
  vendorName: string;
  vendorContact: string;
  taxAmount: string | null;
  reference: string | null;
  shopId: number;
  processedById: number;
  approvedById: number | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  actors: {
    id: number;
    name: string;
  };
  shops: {
    id: number;
    shopName: string;
  };
  approvedBy: any | null;
}

export interface ExpenseFormData {
  shopId: number;
  amount: number;
  category: 'RENT' | 'UTILITIES' | 'SUPPLIES' | 'MARKETING' | 'OTHER';
  subcategory: string;
  description: string;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MPESA' | 'AIRTELMONEY';
  vendorName: string;
  vendorContact: string;
}

export interface ExpenseListResponse {
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    totalAmount: string;
    averageAmount: string;
    minAmount: string;
    maxAmount: string;
  };
}

export interface ExpenseCreateResponse {
  success: boolean;
  message: string;
  data: Expense;
}
