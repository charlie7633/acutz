import React, { createContext, useState, useEffect } from 'react';
import { account } from '../config/appwriteConfig';
import { ID } from 'react-native-appwrite';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a user is already logged in
  const checkUser = async () => {
    try {
      const currentUser = await account.get();
      setUser({ ...currentUser, uid: currentUser.$id });
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Login Function
  const login = async (email, password) => {
    await account.createEmailPasswordSession(email, password);
    await checkUser();
  };

  // Register Function
  const register = async (email, password) => {
    await account.create(ID.unique(), email, password);
    await account.createEmailPasswordSession(email, password);
    await checkUser();
  };

  // Logout Function
  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.log("Error logging out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
