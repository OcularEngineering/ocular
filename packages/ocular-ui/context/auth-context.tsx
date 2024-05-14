import  React, { createContext, useContext, useState } from 'react';

type AuthContextType = {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
};

import { ApplicationContext } from "@/context/context"
  
const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {

  const { userSignedIn, setUserSignedIn } = useContext(ApplicationContext)

  const [user, setUser] = useState(null);

  const login = (userData) => {
    console.log("User logged DATA: ", userData)

    if (userData) {
      setUserSignedIn(true);
      console.log("userSignedIn boolean: ", userSignedIn)
    }
  };

  console.log("AuthProvider: ", user)

  const logout = () => {
    setUserSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
