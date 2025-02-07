import { useEffect, useState } from 'react';
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Package,
  Store,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

interface Report {
  id: {
    productId: string;
    sellerId: string;
    shopname: string;
    soldunits: number;
  };
  soldprice: number;
  netamountsoldforthegood: number;
  commission: number;
  totalprofit: number;
  totalTransaction: number;
  productname: string;
  productmodel: string;
  soldunits: number;
  shopname: string;
  sellername: string;
}

interface GeneralSalesData {
  generalReport: Report[];
  totalSales: number;
  totalProfit: number;
}

interface StatCardProps {
  title: string;
  value: any;
  secondaryValue?: string;
  icon: any;
  trend?: number;
  valueType: string;
}

const TabButton = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium transition-colors duration-200 ${
      selected
        ? 'text-primary border-b-2 border-primary'
        : 'text-bodydark hover:text-black dark:hover:text-white'
    }`}
  >
    {children}
  </button>
);

const Sales = () => {
  const StatCard = ({
    title,
    value,
    secondaryValue,
    icon: Icon,
    trend,
    valueType,
  }: StatCardProps) => (
    <div className="bg-white rounded-lg shadow-card p-6 h-full border border-stroke dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between mb-4">
        <span className="text-bodydark2 font-medium">{title}</span>
        <Icon className="text-primary w-6 h-6" />
      </div>
      <div className="space-y-2">
        {valueType === 'currency' && (
          <span className="text-sm font-bold italic text-bodydark2">KES</span>
        )}
        <div className="text-title-md font-bold text-black dark:text-white">
          {fetchingSales ? <CircularProgress size={24} /> : value}
        </div>
        {secondaryValue && (
          <div className="text-bodydark text-sm">{secondaryValue}</div>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend > 0 ? (
              <ArrowUp className="text-meta-3 w-4 h-4" />
            ) : (
              <ArrowDown className="text-meta-1 w-4 h-4" />
            )}
            <span
              className={`ml-1 ${trend > 0 ? 'text-meta-3' : 'text-meta-1'}`}
            >
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const [fetchingSales, setFetchingSales] = useState(false);
  const [salesData, setSalesData] = useState({
    sales: [],
    totalSales: 0,
    totalProfit: 0,
  });
  const [timeFrame, setTimeFrame] = useState('day');
  const [loading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // const fetchSalesData = async () => {
  //   try {
  //     setIsLoading(true);
  //     const tokenObj = localStorage.getItem('tk');
  //     if (tokenObj) {
  //       const response = await axios.get(
  //         `${import.meta.env.VITE_SERVER_HEAD}/api/sales/all?period=${timeFrame}&page=1`,
  //         { withCredentials: true }
  //       );
  //       const data = await response.data
  //       setSalesData(data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching sales data', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchSalesData();
  // }, [timeFrame]);

  // Fetch
  const fetchSalesData = async () => {
    try {
      setFetchingSales(true);
      const tokenObj = localStorage.getItem('tk');
      if (tokenObj) {
        const requests = [
          axios.get(
            `${
              import.meta.env.VITE_SERVER_HEAD
            }/api/sales/all?period=${timeFrame}&page=1`,
            { withCredentials: true },
          ),
          axios.get(
            `${
              import.meta.env.VITE_SERVER_HEAD
            }/api/sales/all?period=${timeFrame}&page=2`,
            { withCredentials: true },
          ),
          axios.get(
            `${
              import.meta.env.VITE_SERVER_HEAD
            }/api/sales/all?period=${timeFrame}&page=3`,
            { withCredentials: true },
          ),
        ];

        const responses = await Promise.all(requests);
        console.log(responses);

        // Flatten sales data from all responses
        const allSales = responses
          .map((res) => res.data.data.sales) // Extract `data` from each response
          .flat(); // Combine all pages into one array

        console.log('All sales:', allSales);

        // Calculate total sales and profit
        const totalSales = allSales.reduce(
          (sum, sale) => sum + sale.soldprice,
          0,
        ); // Adjust key
        const totalProfit = allSales.reduce(
          (sum, sale) => sum + sale.totalprofit,
          0,
        ); // Adjust key
        const totalCommission = allSales.reduce(
          (sum, sale) => sum + sale.commission,
          0,
        ); // Adjust key

        // Update state
        setSalesData({
          sales: allSales,
          totalSales,
          totalProfit,
          totalCommission,
        });
      }
      console.log(salesData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setFetchingSales(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
    console.log('Sales data:', salesData);
  }, [timeFrame]);

  const calculateMetrics = () => {
    const { sales } = salesData;
    if (!sales?.length)
      return {
        totalSales: 0,
        totalUnits: 0,
        totalCommission: 0,
        totalProfit: 0,
        avgTicketSize: 0,
        shopMetrics: [],
        productMetrics: [],
      };

    const totalUnits = sales.reduce(
      (sum, item) => sum + item.totaltransaction,
      0,
    );
    const totalCommission = sales?.reduce(
      (sum, item) => sum + item.commission,
      0,
    );
    const avgTicketSize = salesData.totalSales / sales.length;

    // Calculate shop metrics
    const shopData = new Map();
    sales.forEach((item) => {
      const shopKey = item.shopname[0];
      if (!shopData.has(shopKey)) {
        shopData.set(shopKey, {
          name: item.shopname[0],
          sales: 0,
          units: 0,
          profit: 0,
        });
      }
      const shop = shopData.get(shopKey);
      shop.sales += item.soldprice * item.totalTransaction;
      shop.units += item.totalTransaction;
      shop.profit += item.totalprofit;
    });
    const shopMetrics = Array.from(shopData.values());

    // Calculate product metrics
    const productData = new Map();
    sales.forEach((item: any) => {
      const productKey = item.productname;
      if (!productData.has(productKey)) {
        productData.set(productKey, {
          name: item.productname,
          sales: 0,
          units: 0,
          profit: 0,
        });
      }
      const product = productData.get(productKey);
      product.sales += item.soldprice * item.totalTransaction;
      product.units += item.totalTransaction;
      product.profit += item.totalprofit;
    });
    const productMetrics = Array.from(productData.values());

    return {
      totalSales: salesData.totalSales,
      totalUnits,
      totalCommission: salesData.totalCommission,
      totalProfit: salesData.totalProfit,
      avgTicketSize,
      shopMetrics,
      productMetrics,
    };
  };

  const metrics = calculateMetrics();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // const StatCard = ({
  //   title,
  //   value,
  //   secondaryValue,
  //   icon: Icon,
  //   trend,
  //   valueType,
  // }: StatCardProps) => (
  //   <Card sx={{ height: '100%' }}>
  //     <CardContent>
  //       <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
  //         <Typography className="text-bodydark2" gutterBottom>
  //           {title}
  //         </Typography>
  //         <Icon className="text-primary" sx={{ color: 'text-secondary' }} />
  //       </Box>
  //       {valueType === 'currency' && (
  //         <span className="text-sm font-bold italic text-bodydark2">KES</span>
  //       )}
  //       <Typography variant="h4" component="div">
  //         {value}
  //       </Typography>
  //       {secondaryValue && (
  //         <Typography className="text-bodydark" sx={{ mt: 1 }}>
  //           {secondaryValue}
  //         </Typography>
  //       )}
  //       {trend && (
  //         <Box className="flex items-center mt-1">
  //           {trend > 0 ? (
  //             <ArrowUpIcon className="text-green-500" />
  //           ) : (
  //             <ArrowDownIcon className="text-red-500 mr-1/2" />
  //           )}
  //           <Typography
  //             variant="body2"
  //             className={`${trend > 0 ? 'text-green-500' : 'text-red-500'}`}
  //           >
  //             {Math.abs(trend)}%
  //           </Typography>
  //         </Box>
  //       )}
  //     </CardContent>
  //   </Card>
  // );

  return (
    <div className="py-6 md:px-4 mx-auto">
      <div className="mb-8">
        <h1 className="text-title-lg font-bold text-black dark:text-white mb-2">
          Sales Analytics
        </h1>
        <div className="flex justify-between items-center">
          <p className="text-bodydark">
            Comprehensive sales performance insights
          </p>
          <select
            value={timeFrame}
            onChange={(e) => {
              setTimeFrame(e.target.value);
              setSalesData({ sales: [], totalSales: 0, totalProfit: 0 });
            }}
            className="border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none appearance-none"
          >
            <option value="day">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={metrics.totalSales.toLocaleString()}
          valueType="currency"
          icon={DollarSign}
        />
        <StatCard
          title="Total Profit"
          value={metrics.totalProfit?.toLocaleString() || 0}
          valueType="currency"
          icon={TrendingUp}
        />
        <StatCard
          title="Units Sold"
          value={metrics.totalUnits.toLocaleString()}
          valueType="int"
          secondaryValue={`Total commission: ${metrics.totalCommission.toLocaleString()}`}
          icon={Package}
        />
        <StatCard
          title="Active Shops"
          value={metrics.shopMetrics.length}
          secondaryValue={`Avg. revenue: ${(
            metrics.totalSales / metrics.shopMetrics.length
          ).toLocaleString()}`}
          icon={Store}
          valueType="number"
        />
      </div>

      <div className="border-b border-stroke dark:border-strokedark mb-6">
        <div className="flex space-x-4">
          <TabButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
            Overview
          </TabButton>
          <TabButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
            Products
          </TabButton>
          <TabButton selected={activeTab === 2} onClick={() => setActiveTab(2)}>
            Shops
          </TabButton>
        </div>
      </div>

      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-sm font-semibold mb-4 text-black dark:text-white">
              Product Revenue Distribution
            </h2>
            <div className="h-90">
              <ResponsiveContainer>
                <BarChart data={metrics.productMetrics}>
                  <XAxis dataKey="name"/>
                  <YAxis order={salesData.totalSales} ascent={1} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#42C8B7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-sm font-semibold mb-4 text-black dark:text-white">
              Shop Revenue Distribution
            </h2>
            <div className="h-90">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={metrics.shopMetrics}
                    dataKey="sales"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {metrics.shopMetrics.map((entry , index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            '#42C8B7',
                            '#80CAEE',
                            '#10B981',
                            '#FFBA00',
                            '#FF6766',
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 1 || activeTab === 2) && (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-card border border-stroke dark:border-strokedark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                  <th className="px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                    {activeTab === 1 ? 'Product' : 'Shop'}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                    Units
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {(activeTab === 1
                  ? metrics.productMetrics
                  : metrics.shopMetrics
                ).map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                      {item.sales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                      {item.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                      {item.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
