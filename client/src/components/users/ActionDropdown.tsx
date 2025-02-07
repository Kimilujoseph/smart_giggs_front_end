import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import { User } from '../../types/user';
import zIndex from '@mui/material/styles/zIndex';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { set } from 'date-fns';

interface ActionPayload {
  action: string;
  user_id: string;
  email: string;
}

interface ActionDropdownProps {
  handleAction: (payload: ActionPayload) => void;
  setUserId: (id: string) => void;
  selectedUser: any;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  handleAction,
  setUserId,
  selectedUser,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [dropUpwards, setDropUpwards] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (dropdownRef.current && dropdownOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 160; // Approximate height of your dropdown
      setDropUpwards(spaceBelow < dropdownHeight);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    const updateDropdownPosition = () => {
      if (dropdownRef.current && dropdownOpen) {
        const buttonRect = dropdownRef.current.parentElement?.getBoundingClientRect();
        const dropdown = dropdownRef.current;
  
        if (buttonRect) {
          dropdown.style.top = `${buttonRect.bottom}px`;
          dropdown.style.left = `${buttonRect.left}px`;
        }
      }
    };
  
    window.addEventListener('scroll', updateDropdownPosition);
    return () => window.removeEventListener('scroll', updateDropdownPosition);
  }, [dropdownOpen]);
  

  useEffect(() => {
    const tokenObj = localStorage.getItem('tk');
    if (tokenObj) {
      const decoded: any = jwt_decode(tokenObj) as DecodedToken;
      if (
        decoded.role === 'superuser' ||
        decoded.role === 'manager' ||
        decoded.role === 'seller'
      ) {
        setUser(decoded);
        setLoggedIn(true);
      }
    } else {
      navigate('/auth/signin');
    }
  }, []);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      {selectedUser?.id !== user?.id ?
      (<button
        onClick={() => {
          if (!dropdownOpen) {
            setUserId(selectedUser.id);
          } else {
            setUserId('');
          }
          setDropdownOpen(!dropdownOpen);
        }}
        className="flex items-center gap-4 relative"
      >
        <ChevronDown
          onClick={(e) => {
            setDropdownOpen(!dropdownOpen);
          }}
          className={`transition-transform duration-300 ease-in-out ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      ) : (
        <span>You</span>
      )}

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className={`${dropUpwards ? 'bottom-6' : 'top-full'} absolute right-4 w-48 flex-col rounded-md border border-stroke bg-white shadow-lg z-50 border-primary/[0.5] dark:bg-boxdark transition-all duration-300 ease-in-out`}
        >
          {selectedUser?.role === 'seller' && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleAction({
                  action: 'view',
                  user_id: selectedUser.id,
                  email: selectedUser.email,
                });
              }}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
            >
              View
            </button>
          )}
          {(selectedUser.workingstatus === 'active') && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleAction({
                  action: selectedUser?.role === 'seller' ? 'promote' : 'demote',
                  user_id: selectedUser.id,
                  email: selectedUser.email,
                });
              }}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
            >
              {selectedUser?.role === 'seller' ? 'Promote' : 'Demote'}
            </button>
          )}
          {selectedUser.workingstatus === 'active' && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleAction({
                  action: 'suspend',
                  user_id: selectedUser.id,
                  email: selectedUser.email,
                });
              }}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
            >
              Suspend
            </button>
          )}
          {(selectedUser.workingstatus === 'inactive' ||
            selectedUser.workingstatus === 'suspended') && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleAction({
                  action: 'active',
                  user_id: selectedUser.id,
                  email: selectedUser.email,
                });
              }}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
            >
              Activate
            </button>
          )}
          {selectedUser.workingstatus.toLowerCase() !== 'inactive' && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleAction({
                  action: 'deactivate',
                  user_id: selectedUser.id,
                  email: selectedUser.email,
                });
              }}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 lg:text-base"
            >
              Deactivate
            </button>
          )}
        </div>
      )}
    </ClickOutside>
  );
};

export default ActionDropdown;
