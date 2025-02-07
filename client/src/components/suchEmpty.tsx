interface SuchEmptyProps {
  message: string;
  description: string;
  variant?: string;
}
import { Notebook, PhoneIcon } from 'lucide-react';

const iconVariants: any = {
  default: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-gray-400 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8v4m0 4v.01"
      />
    </svg>
  ),
  emptyCart: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-gray-400 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="9" cy="20" r="1" strokeWidth="2" />
      <circle cx="20" cy="20" r="1" strokeWidth="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L21 6H6"
      />
    </svg>
  ),
  emptyListing: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-gray-400 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <line x1="3" y1="9" x2="21" y2="9" strokeWidth="2" />
      <line x1="9" y1="3" x2="9" y2="21" strokeWidth="2" />
      <circle cx="6" cy="6" r="0.5" fill="currentColor" />
      <circle cx="12" cy="6" r="0.5" fill="currentColor" />
      <circle cx="18" cy="6" r="0.5" fill="currentColor" />
    </svg>
  ),
  'no-sales': <Notebook size={50} />,
};

const SuchEmpty = ({ message, description, variant }: SuchEmptyProps) => {
  return (
    <div className="flex flex-col items-center py-8">
      <span className='mb-2'>{
        iconVariants[
          variant && iconVariants.hasOwnProperty(variant) ? variant : 'default'
        ]
      }</span>
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm text-center text-gray-400 mt-1">{description}</p>
    </div>
  );
};

export default SuchEmpty;
