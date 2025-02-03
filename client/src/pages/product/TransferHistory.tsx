import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import axios from 'axios';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { ArrowRight, ArrowLeftRight, Clock, FileWarningIcon, TriangleAlertIcon } from 'lucide-react';
import Loader from '../../common/Loader';
import Message from '../../components/alerts/Message';

interface Shop {
  _id: string;
  name: string;
  id: string;
}

interface Transfer {
  _id: string;
  quantity: number;
  fromShop: Shop | null;
  toShop: Shop | null;
  status: string;
  type: string;
  date: string;
}

interface GroupedTransfers {
  [key: string]: Transfer[];
}

const ProductTransferHistory = ({
  product,
  productId,
  isMobile,
}: {
  product: any | null;
  productId: string | null;
  isMobile: boolean;
}) => {
  // return (
  //   <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
  //     <p className="text-yellow-600 flex items-center gap-2">
  //       <TriangleAlertIcon className="h-6 w-6" />
  //       Feature is under development
  //     </p>
  //   </div>
  // );
  if (!productId)
    return (
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
        <p className="text-gray-500 dark:text-gray-400">
          Could not fetch product details :(
        </p>
      </div>
    );
  const [transferHistory, setTransferHistory] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );

  const fetchTransferHistory = async () => {
    try {
      setIsLoading(true);
      console.log(productId);
      
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/${
          product.itemType ? 'mobile' : 'accessory'
        }/item/transferhistory/${productId}`,
        { withCredentials: true },
      );

      // Safely extract transfer history based on response structure
      let historyData: Transfer[] = [];
      if (isMobile && response.data.message?.transferHistory) {
        historyData = response.data.message.transferHistory;
      } else if (
        !isMobile &&
        response.data.message?.productFound?.transferHistory
      ) {
        historyData = response.data.message.productFound.transferHistory;
      }

      // Sort the history if it exists
      if (historyData.length > 0) {
        const sortedHistory = [...historyData].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setTransferHistory(sortedHistory);
      } else {
        setTransferHistory([]);
      }
    } catch (error: any) {
      console.error('Error fetching transfer history', error);
      setMessage({
        text:
          error.response.data.message ||
          error.message ||
          'Failed to load transfer history. Please try again later.',
        type: `${error.response.status === 404 ? 'warning' : 'error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransferHistory();
  }, [productId, isMobile]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-meta-3';
      case 'pending':
        return 'text-meta-6';
      default:
        return 'text-meta-1';
    }
  };

  const getTransferDescription = (transfer: Transfer) => {
    if (transfer.type === 'distribution') {
      return `Distributed from ${
        transfer.fromShop ? transfer.fromShop.name : 'Unknown Shop'
      } to ${transfer.toShop ? 'to ' + transfer.toShop.name : 'Unknown Shop'}`;
    } else {
      return `Transferred from ${
        transfer.fromShop ? +transfer.fromShop.name : 'Unknown Shop'
      } ${transfer.toShop ? 'to ' + transfer.toShop.name : 'Unknown Shop'}`;
    }
  };

  return (
    <div className="container mx-auto bg-whiten dark:bg-boxdark-2">
      {/* <Breadcrumb pageName="Transfer History" /> */}

      {message && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <Card className="bg-whiten dark:bg-boxdark-2">
        {/* <CardHeader className="dark:border-strokedark bg-whiten dark:bg-boxdark-2">
          <Typography className="text-title-md text-black dark:text-white font-medium">
            Product Transfer History
          </Typography>
        </CardHeader> */}
        <CardContent className="bg-whiten dark:bg-boxdark-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : transferHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-bodydark" />
              <p className="mt-4 text-lg text-bodydark">
                No Transfer History Available
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ArrowLeftRight className="h-6 w-6 text-primary dark:text-primary" />
                  <h3 className="font-semibold text-black dark:text-white text-title-sm">
                    Transfer Timeline
                  </h3>
                </div>

                <div className="space-y-4">
                  {transferHistory.map((transfer) => (
                    <div
                      key={transfer._id}
                      className="relative pl-6 border-l-2 border-stroke dark:border-strokedark"
                    >
                      <div className="absolute left-[-5px] top-0 h-2 w-2 rounded-full bg-primary"></div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`font-medium capitalize ${getStatusColor(
                              transfer.status?.toLowerCase(),
                            )}`}
                          >
                            {transfer.status}
                          </span>
                          <span className="text-sm text-bodydark2">
                            {formatDate(transfer.date)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-black dark:text-bodydark">
                            {getTransferDescription(transfer)}
                          </span>
                        </div>

                        <div className="text-sm text-bodydark2 mt-1">
                          Quantity: {transfer.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductTransferHistory;
