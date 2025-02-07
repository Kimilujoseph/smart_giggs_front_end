import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../types/decodedToken';
import {
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Clock, Store, ArrowRight } from 'lucide-react';

interface Assignment {
  id: string;
  shopId: {
    id: string;
    name: string;
    id: string;
  };
  type: string;
  fromDate: string | null;
  toDate: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupedAssignments {
  [key: string]: Assignment[];
}

const AssignmentHistory: React.FC<{
  email?: string;
  imported?: boolean;
  assignmentData?: any;
}> = ({ email, imported, assignmentData }) => {
  const [sellerAssignment, setSellerAssignment] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data');
        setIsLoading(true);
        const tokenObj = localStorage.getItem('tk');
        if (tokenObj) {
          const decoded = jwt_decode<DecodedToken>(tokenObj);
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${email ? email : decoded.email}`,
            { withCredentials: true },
          );

          const { assignment } = response.data.user;
          // Sort assignments by date
          const sortedAssignments = assignment.sort(
            (a: Assignment, b: Assignment) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          setSellerAssignment(sortedAssignments);
        }
      } catch (error: any) {
        console.error('Error fetching user data', error);
        setError(
          error.response?.data.message ||
            error.message ||
            'Failed to load assignment history. Try again later.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (assignmentData) {
      const sortedAssignments = assignmentData.sort(
        (a: Assignment, b: Assignment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setSellerAssignment(sortedAssignments);
      setIsLoading(false);
    } else {
      fetchUserData();
    }
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const groupAssignmentsByShop = (
    assignments: Assignment[],
  ): GroupedAssignments => {
    return assignments.reduce((groups: GroupedAssignments, assignment) => {
      const shopId = assignment.shopID;
      if (!groups[shopId]) {
        groups[shopId] = [];
      }
      groups[shopId].push(assignment);
      return groups;
    }, {});
  };

  const getStatusColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'assigned':
        return 'text-meta-3';
      case 'removed':
        return 'text-meta-1';
      default:
        return 'text-meta-6';
    }
  };

  return (
    <div
      className={`container mx-auto ${
        !imported && 'md:px-4 py-8'
      } bg-whiten dark:bg-boxdark-2`}
    >
      {!imported && <Breadcrumb pageName="Assignment History" />}

      <Card className="bg-whiten dark:bg-boxdark">
        <CardContent
          className={`${
            !imported ? 'bg-whiten dark:bg-boxdark-2' : 'dark:bg-boxdark'
          }`}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <CircularProgress />
            </div>
          ) : error ? (
            <div className="text-meta-1 text-center p-4">{error}</div>
          ) : sellerAssignment.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-bodydark" />
              <p className="mt-4 text-lg text-bodydark">
                No Assignment History Available
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupAssignmentsByShop(sellerAssignment)).map(
                ([shopId, assignments]) => (
                  <div
                    key={shopId}
                    className={`rounded-lg border border-stroke dark:border-strokedark ${
                      imported
                        ? 'bg-bodydark/30 dark:bg-boxdark-2/30'
                        : 'bg-white dark:bg-boxdark'
                    } p-3 md:p-6`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Store className="h-6 w-6 text-primary dark:text-primary" />
                      <h3 className="font-semibold text-black dark:text-white text-title-sm">
                        {assignments[0].shops.shopName}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {assignments.map((assignment, index) => (
                        <div
                          key={assignment.id}
                          className="relative pl-6 border-l-2 border-stroke dark:border-strokedark"
                        >
                          {/* Timeline dot */}
                          <div className="absolute left-[-5px] top-0 h-2 w-2 rounded-full bg-primary"></div>

                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`font-medium capitalize ${getStatusColor(
                                  assignment.status,
                                )}`}
                              >
                                {assignment.status}
                              </span>
                              <span className="text-xs md:text-sm text-bodydark2">
                                {formatDate(assignment.fromDate)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-bodydark2">Duration:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-black dark:text-bodydark">
                                  {formatDate(assignment.fromDate)}
                                </span>
                                <ArrowRight className="h-4 w-4 text-bodydark2" />
                                <span className="text-black dark:text-bodydark">
                                  {formatDate(assignment.toDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentHistory;
