import React, { useEffect, useState } from 'react';
import { Avatar, Card, CardContent } from '@mui/material';
import {
  User,
  ChartBar,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Headphones,
  Smartphone,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import SuchEmpty from '../components/suchEmpty';
import jwt_decode from 'jwt-decode';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Type definitions
interface Sale {
  id: string;
  category: 'accessory' | 'phone';
  soldprice: number;
  quantity: number;
  createdAt: string;
  price: number;
  profit: number;
  totaltransaction: number;
  productname: string;
  totalsoldunits: number;
}

interface Assignment {
  shopId: {
    name: string;
  };
  type: 'assigned' | 'unassigned';
  fromDate: string;
  toDate: string;
}

interface UserProfile {
  id: string;
  profileimage: string;
  name: string;
  email: string;
  phone: string;
  assignment: Assignment[];
  AccessorySalesHistory: Sale[];
  MobilePhoneSalesHistory: Sale[];
}

interface SalesData {
  totalTransactions: number;
  totalSales: number;
  totalProfit: number;
  totalCommission: number;
  recentSales: Sale[];
}

interface DecodedToken {
  email: string;
}

interface Expense {
  id: number;
  description: string;
  amount: string;
  category: string;
  subcategory: string | null;
  expenseDate: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  paymentMethod: string;
  vendorName: string | null;
  shopId: number;
  shops: {
    id: number;
    shopName: string;
  };
  approvedBy: {
    id: number;
    name: string;
  } | null;
  rejectionReason: string | null;
}

interface ExpenseData {
  expenses: Expense[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  totalAmount: string;
  averageAmount: string;
  minAmount: string;
  maxAmount: string;
}

const UserView: React.FC = () => {
  const token = localStorage.getItem('tk');
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Expense state
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expensePage, setExpensePage] = useState(1);
  const [expenseLimit] = useState(10);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userEmail = decodeURIComponent(params.get('email') || '');

  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${userEmail}`,
          { credentials: 'include' },
        );

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${responseText}`);
        }

        try {
          const data = JSON.parse(responseText);
          setUserProfile(data.user);
        } catch (e) {
          throw new Error(`Failed to parse JSON response: ${responseText}`);
        }

      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userEmail]);

  // Fetch expenses when userProfile is available
  useEffect(() => {
    if (!userProfile?.id) return;

    const fetchExpenses = async () => {
      setExpenseLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_HEAD}/api/expenses/?page=${expensePage}&limit=${expenseLimit}&employeeId=${userProfile.id}`,
          { credentials: 'include' },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }

        const result = await response.json();
        setExpenseData(result.data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setExpenseLoading(false);
      }
    };

    fetchExpenses();
  }, [userProfile?.id, expensePage, expenseLimit]);

  const calculateTotalAmount = (
    user: UserProfile,
    field: 'price' | 'profit',
  ): number => {
    return (
      (user.AccessorySalesHistory?.reduce(
        (sum, sale) => sum + sale[field],
        0,
      ) || 0) +
      (user.MobilePhoneSalesHistory?.reduce(
        (sum, sale) => sum + sale[field],
        0,
      ) || 0)
    );
  };

  const getRecentSales = (user: UserProfile): Sale[] => {


    return [
      ...(user.AccessorySalesHistory || []),
      ...(user.MobilePhoneSalesHistory || []),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  };

  const formatDate = (date: string): string => {
    if (!date) {
      return 'N/A';
    }
    return format(new Date(date), 'MMM d, yyyy');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'narrowSymbol',
    })
      .format(amount)
      .replace('KES', 'KES ');
  };

  // Expense trend data processing
  const expenseTrendData = expenseData?.expenses
    .slice()
    .sort((a, b) => new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime())
    .map(exp => ({
      date: format(new Date(exp.expenseDate), 'MMM dd'),
      amount: parseFloat(exp.amount),
      status: exp.status,
      category: exp.category,
    })) || [];

  const expenseCategoryBreakdown = expenseData?.expenses.reduce((acc: any, exp) => {
    const category = exp.category || 'OTHER';
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += parseFloat(exp.amount);
    return acc;
  }, {}) || {};

  const categoryPieData = Object.values(expenseCategoryBreakdown);

  const expenseStatusCount = expenseData?.expenses.reduce((acc: any, exp) => {
    acc[exp.status] = (acc[exp.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'REJECTED': return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const pieColors = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d', '#FF6B6B'];

  const stats = [
    {
      title: 'Member Since',
      value: formatDate(
        userProfile?.assignment?.[0]?.fromDate ||
        new Date().toISOString(),
      ),
      icon: Calendar,
      color: 'text-amber-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!userProfile) {
    return <div className="text-center p-4">No user data found</div>;
  }

  return (
    <>
      <Breadcrumb pageName="Seller Profile" />
      <div className="mx-auto max-w-7xl py-8">
        {/* Profile Header */}
        <Card className="mb-6 dark:bg-boxdark dark:text-bodydark">
          <CardContent className="flex items-center gap-6 p-6">
            <Avatar src={userProfile.profileimage} className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center" />
            {/* <img
              src={
                userProfile.profileimage ||
                'https://www.strasys.uk/wp-content/uploads/2022/02/Depositphotos_484354208_S.jpg'
              }
              className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center"
            /> */}
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {userProfile.name}
              </h2>
              <div className="flex gap-2 md:gap-4 text-gray-600 dark:text-slate-400 md:text-sm text-xs">
                <span>{userProfile.email}</span>
                <span>•</span>
                <span>{userProfile.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 dark:text-bodydark2">
                      {stat.title}
                    </p>
                    <p className="text-xl font-semibold text-xs sm:text-lg lg:text-lg">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* View Sales Report Card */}
          <Card className="dark:bg-boxdark dark:text-bodydark">
            <CardContent className="flex flex-col items-center justify-center h-full">
              <h1 className="text-lg font-bold mb-4">Sales Report</h1>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                View the detailed sales report for {userProfile.name}.
              </p>
              <button
                onClick={() => navigate(`/user/sales?userId=${userProfile.id}`)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                View Sales Report
              </button>
            </CardContent>
          </Card>

          {/* Recent Assignments Card */}
          <Card className="dark:bg-boxdark dark:text-bodydark">
            <h1 className="px-6 font-bold pt-4 text-lg">
              Recent Shop Assignments
            </h1>
            <CardContent>
              {!userProfile.assignment?.length ? (
                <SuchEmpty
                  message="No Assignments"
                  description={`${userProfile.name} has not been assigned to any shop`}
                  variant="default"
                />
              ) : (
                <div className="space-y-4">
                  {userProfile.assignment
                    .slice(0, 3)
                    .map((assignment: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-4 ${idx !== 2 ? 'border-b border-bodydark2' : ''
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <Building2 className="h-6 w-6 text-blue-500" />
                          <div>
                            <p className="font-semibold">
                              {assignment.shops.shopName}
                            </p>
                            <p
                              className={`text-sm ${assignment.status === 'assigned'
                                  ? 'text-emerald-500'
                                  : 'text-red-500'
                                }`}
                            >
                              {assignment.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-gray-600 text-xs md:text-sm">
                          <div>{formatDate(assignment.fromDate)}</div>
                          <div>{formatDate(assignment.toDate)}</div>
                        </div>
                      </div>
                    ))}
                  {/* <button
                    onClick={() => navigate('/assignmentHistory/:userId')}
                    className="text-blue-500 dark:text-primary underline cursor-pointer"
                  >
                    View full history
                  </button> */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expense Trend Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-bodydark">Expense Trend</h2>
          
          {/* Expense Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-bodydark2">Total Expenses</p>
                    <p className="text-xl font-semibold">{formatCurrency(parseFloat(expenseData?.totalAmount || '0'))}</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-bodydark2">Average Amount</p>
                    <p className="text-xl font-semibold">{formatCurrency(parseFloat(expenseData?.averageAmount || '0'))}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-bodydark2">Total Count</p>
                    <p className="text-xl font-semibold">{expenseData?.totalCount || 0}</p>
                  </div>
                  <ChartBar className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-bodydark2">Status Breakdown</p>
                    <p className="text-xs text-gray-500 dark:text-bodydark2">
                      <span className="text-green-600">{expenseStatusCount['APPROVED'] || 0}</span> /{' '}
                      <span className="text-red-600">{expenseStatusCount['REJECTED'] || 0}</span> /{' '}
                      <span className="text-yellow-600">{expenseStatusCount['PENDING'] || 0}</span>
                    </p>
                  </div>
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Expense Trend Line Chart */}
            <Card className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Expense Over Time</h3>
                {expenseLoading ? (
                  <div className="flex items-center justify-center h-60">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  </div>
                ) : expenseTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={expenseTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#FF6B6B" name="Amount" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 h-60 flex items-center justify-center">No expense trend data</p>
                )}
              </CardContent>
            </Card>

            {/* Expense Category Pie Chart */}
            <Card className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Expense by Category</h3>
                {expenseLoading ? (
                  <div className="flex items-center justify-center h-60">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  </div>
                ) : categoryPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {categoryPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 h-60 flex items-center justify-center">No category data</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expense Table with Pagination */}
          <Card className="dark:bg-boxdark dark:text-bodydark">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Expenses</h3>
                {expenseData && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpensePage(prev => Math.max(1, prev - 1))}
                      disabled={expensePage === 1 || expenseLoading}
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-meta-4 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Previous
                    </button>
                    <span className="text-sm dark:text-bodydark">
                      Page {expensePage} of {expenseData.totalPages}
                    </span>
                    <button
                      onClick={() => setExpensePage(prev => Math.min(expenseData.totalPages, prev + 1))}
                      disabled={expensePage === expenseData.totalPages || expenseLoading}
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-meta-4 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {expenseLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                </div>
              ) : expenseData?.expenses && expenseData.expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Amount</th>
                        <th scope="col" className="px-6 py-3">Shop</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Approved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseData.expenses.map((expense) => (
                        <tr key={expense.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4">{formatDate(expense.expenseDate)}</td>
                          <td className="px-6 py-4">{expense.description}</td>
                          <td className="px-6 py-4">{expense.category}{expense.subcategory && ` - ${expense.subcategory}`}</td>
                          <td className="px-6 py-4 font-medium">{formatCurrency(parseFloat(expense.amount))}</td>
                          <td className="px-6 py-4">{expense.shops.shopName}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(expense.status)}`}>
                              {expense.status}
                            </span>
                            {expense.status === 'REJECTED' && expense.rejectionReason && (
                              <p className="mt-1 text-xs text-red-500" title={expense.rejectionReason}>
                                {expense.rejectionReason.slice(0, 30)}...
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">{expense.approvedBy?.name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <SuchEmpty
                  message="No Expenses"
                  description={`No expense data found for ${userProfile.name}`}
                  variant="default"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserView;