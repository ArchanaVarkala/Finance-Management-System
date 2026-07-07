export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Salary'
  | 'Others';

export interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id?: string;
  amount: number;
  month: number;
  year: number;
  user: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
