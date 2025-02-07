import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { User } from '../types/user';

interface AppContextInterface {
  successMessage: string;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  loginSuccess: boolean;
  setLoginSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AppContext = createContext<AppContextInterface | undefined>(undefined);

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  return (
    <AppContext.Provider
      value={{
        successMessage,
        setSuccessMessage,
        loginSuccess,
        setLoginSuccess,
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = (): AppContextInterface => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { AppProvider, useAppContext };
