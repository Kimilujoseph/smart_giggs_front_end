import React from 'react';
import { CircularProgress } from '@mui/material';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductsTableContentProps {
  loading: boolean;
  inventory: Product[];
  highlightedId: number | null;
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  userRole?: string;
}

/** Maps a product's stock count to a Tailwind colour class. */
const stockColour = (stock: number): string => {
  if (stock === 0) return 'text-red-500';
  if (stock < 5) return 'text-yellow-500';
  return 'text-green-500';
};

/** Maps a product status to badge colour classes. */
const statusBadgeClasses = (status: Product['status']): string => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-success text-success';
    case 'DELETED':
      return 'bg-danger text-danger';
    case 'SUSPENDED':
      return 'bg-warning text-warning';
    default:
      return 'bg-primary text-primary';
  }
};

const ProductsTableContent: React.FC<ProductsTableContentProps> = ({
  loading,
  inventory,
  highlightedId,
  onViewDetails,
  onEdit,
  onDelete,
  userRole,
}) => (
  <div className="max-w-full overflow-x-auto">
    <table className="w-full table-auto">
      {/* Column Headers */}
      <thead>
        <tr className="bg-gray-2 text-left dark:bg-meta-4">
          {['Item Name', 'Available Stock', 'Min Price', 'Max Price', 'Category', 'Brand', 'Status', 'Actions'].map(
            (header) => (
              <th key={header} className="py-4 px-4 font-medium text-black dark:text-white">
                {header}
              </th>
            ),
          )}
        </tr>
      </thead>

      <tbody>
        {/* Loading State */}
        {loading ? (
          <tr>
            <td colSpan={8} className="py-8">
              <div className="flex justify-center">
                <CircularProgress size={32} />
              </div>
            </td>
          </tr>
        ) : inventory.length === 0 ? (
          /* Empty State */
          <tr>
            <td colSpan={8} className="py-8 text-center text-black dark:text-white">
              No items found
            </td>
          </tr>
        ) : (
          /* Data Rows */
          inventory.map((product) => (
            <tr
              key={product.id}
              id={`product-row-${product.id}`}
              className={`border-b border-[#eee] dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4 transition-colors ${
                highlightedId === product.id
                  ? 'bg-yellow-100 dark:bg-yellow-950/40 animate-pulse'
                  : ''
              }`}
            >
              {/* Item Name */}
              <td className="py-3 px-4">
                <h5 className="font-medium text-black dark:text-white">{product.itemName}</h5>
              </td>

              {/* Available Stock */}
              <td className="py-3 px-4">
                <p className={stockColour(product.availableStock)}>{product.availableStock}</p>
              </td>

              {/* Min Price */}
              <td className="py-3 px-4">
                <p className="text-black dark:text-white">{product.minPrice}</p>
              </td>

              {/* Max Price */}
              <td className="py-3 px-4">
                <p className="text-black dark:text-white">{product.maxPrice}</p>
              </td>

              {/* Category */}
              <td className="py-3 px-4">
                <p className="text-black dark:text-white">{product.category}</p>
              </td>

              {/* Brand */}
              <td className="py-3 px-4">
                <p className="text-black dark:text-white">{product.brand}</p>
              </td>

              {/* Status Badge */}
              <td className="py-3 px-4">
                <p
                  className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${statusBadgeClasses(
                    product.status,
                  )}`}
                >
                  {product.status}
                </p>
              </td>

              {/* Action Buttons */}
              <td className="py-3 px-4">
                <div className="flex items-center space-x-3.5">
                  {/* View */}
                  <button
                    onClick={() => onViewDetails(product)}
                    className="p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-meta-4"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5 text-primary" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-meta-4"
                    title="Edit Category"
                  >
                    <Edit className="w-5 h-5 text-yellow-500" />
                  </button>

                  {/* Delete — superuser only */}
                  {userRole === 'superuser' && (
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-meta-4"
                      title="Delete Category"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default ProductsTableContent;
