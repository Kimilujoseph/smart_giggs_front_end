import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

import AnalyticsCards from '../../components/SalesDashboard/AnalyticsCards';

import FiltersPanel from '../../components/SalesDashboard/FiltersPanel';
import SalesTable from '../../components/SalesDashboard/SalesTable';
import { getSalesReport, SalesReportParams } from '../../api/sales_dashboard_manager';
import { subDays, format } from 'date-fns';
import PayCommissionModal from '../../components/SalesDashboard/PayCommissionModal';
import { useAppContext } from '../../context/AppContext';

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SalesReportParams>({ period: 'day' });
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isPayCommissionModalOpen, setPayCommissionModalOpen] = useState(false);
  const { user } = useAppContext();

  const fetchSalesData = useCallback(async (currentFilters: SalesReportParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSalesReport(currentFilters);
      setSalesData(response.data); // Access the nested data object
    } catch (err) {
      setError('Failed to fetch sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData(filters);
  }, [fetchSalesData, filters]);

  const handleFilterChange = useCallback((newFilters: SalesReportParams) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSort = (field: string) => {
    // Implement sort logic if API supports it
    console.log(`Sorting by ${field}`);
  };

  const handleOpenPayCommissionModal = (sale: any) => {
    setSelectedSale(sale);
    setPayCommissionModalOpen(true);
  };

  const handleClosePayCommissionModal = () => {
    setSelectedSale(null);
    setPayCommissionModalOpen(false);
  };

  const handleCommissionPaid = () => {
    handleClosePayCommissionModal();
    fetchSalesData(filters);
  };

  const analyticsData = {
    totalSales: salesData?.analytics?.totalSales || 0,
    totalProfit: salesData?.analytics?.totalProfit || 0,
    totalCommission: salesData?.analytics?.totalCommission || 0,
    totalFinanceAmount: salesData?.analytics?.totalFinanceAmount || 0,
  };

  

  return (
    <div className="space-y-4">
        <AnalyticsCards data={analyticsData} />
        
        <FiltersPanel onFilterChange={handleFilterChange} />
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : salesData?.sales?.length > 0 ? (
          <SalesTable
            sales={salesData.sales}
            totalPages={salesData.totalPages}
            currentPage={salesData.currentPage}
            onPageChange={handlePageChange}
            onSort={handleSort}
            onPayCommission={handleOpenPayCommissionModal}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>No sales data found. Try adjusting the filters.</p>
          </div>
        )}
        {isPayCommissionModalOpen && selectedSale && (
          <PayCommissionModal 
            sale={selectedSale} 
            onClose={handleClosePayCommissionModal} 
            onSuccess={handleCommissionPaid} 
          />
        )}
      </div>
  );
};

export default SalesDashboard;