import React, { useEffect, useState } from 'react';
import { Avatar, AvatarGroup, Card, CardContent } from '@mui/material';
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
} from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';
import SuchEmpty from '../components/suchEmpty';
import jwt_decode from 'jwt-decode';

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
  recentSales: Sale[];
}

interface DecodedToken {
  email: string;
}

const UserView: React.FC = () => {
  const token = localStorage.getItem('tk');
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [salesData, setSalesData] = useState<SalesData>({
    totalTransactions: 0,
    totalSales: 0,
    totalProfit: 0,
    recentSales: [],
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userEmail = decodeURIComponent(params.get('email') || '');

  useEffect(() => {
    if (!userProfile) {
      return;
    }
    
    const fetchUserData = async () => {
      if (!token) {
        setError('Authentication token not found');
        setIsLoading(false);
        return;
      }

      try {
        // const decodedToken = jwt_decode<DecodedToken>(token);
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_HEAD}/api/sales/user/${
            userProfile.id
          }`,
          { credentials: 'include' },
        );

        if (!response.ok && response.status !== 404) {
          throw new Error('Failed to fetch user data');
        }

        const responseData = await response.json();
        const data = responseData.data;
        

        // Calculate sales data
        const totalSales = data.totalSales;
        const totalProfit = data.totalProfit;
        const totalTransactions = data.sales?.reduce((sum: number, sale: Sale) => { return sum + sale.totaltransaction }, 0);
        const recentSales = data.sales?.sort((a: Sale, b: Sale) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
          .slice(0, 3);

        setSalesData({ totalSales, totalProfit, recentSales, totalTransactions });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token, userProfile]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${userEmail}`,
          { credentials: 'include' },
        );

        if (!response.ok && response.status !== 404) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();

        console.log(data);
        
        setUserProfile(data.user);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    };
    fetchUser();
  }, [userEmail]);

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

  const stats = [
    {
      title: 'Total Sales',
      value: salesData.totalSales?.toLocaleString() || '-',
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      title: 'Total Profit',
      value: salesData.totalProfit?.toLocaleString() || '-',
      icon: ChartBar,
      color: 'text-blue-500',
    },
    {
      title: 'Total Transactions',
      value: salesData.totalTransactions?.toLocaleString() || '-',
      icon: TrendingUp,
      color: 'text-purple-500',
    },
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Recent Sales & Assignments */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Sales Card */}
          <Card className="dark:bg-boxdark dark:text-bodydark">
            <h1 className="px-6 font-bold pt-4 text-lg">Recent Sales</h1>
            <CardContent>
              {!salesData.recentSales || salesData.recentSales.length === 0 ? (
                <SuchEmpty
                  message="No Recent Sales"
                  description={`${userProfile.name} has not made any sales recently`}
                  variant="no-sales"
                />
              ) : (
                <div className="space-y-4">
                  {salesData.recentSales.map((sale, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 ${
                        idx !== 2 ? 'border-b border-bodydark2' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {sale.category === 'accessory' ? (
                          <Headphones className="h-6 w-6 text-green-300" />
                        ) : (
                          <Smartphone className="h-6 w-6 text-blue-300" />
                        )}
                        <div>
                          <span  className="font-semibold">{sale.productname}</span>
                          <p>
                            {formatCurrency(sale.soldprice)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {sale.totalsoldunits} item/s
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-xs md:text-md">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(sale.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/outlet/sales')}
                    className="text-blue-500 dark:text-primary underline cursor-pointer"
                  >
                    View all sales
                  </button>
                </div>
              )}
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
                        className={`flex items-center justify-between p-4 ${
                          idx !== 2 ? 'border-b border-bodydark2' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Building2 className="h-6 w-6 text-blue-500" />
                          <div>
                            <p className="font-semibold">
                              {assignment.shops.shopName}
                            </p>
                            <p
                              className={`text-sm ${
                                assignment.status === 'assigned'
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
                  <button
                    onClick={() => navigate('/assignmentHistory/:userId')}
                    className="text-blue-500 dark:text-primary underline cursor-pointer"
                  >
                    View full history
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserView;
