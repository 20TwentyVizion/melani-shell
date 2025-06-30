
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  settings: {
    theme: string;
    notifications: boolean;
    autoSave: boolean;
  };
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (userId: string) => void;
  updateUser: (updates: Partial<User>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  removeUser: (userId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    settings: {
      theme: 'default',
      notifications: true,
      autoSave: true
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    settings: {
      theme: 'neon',
      notifications: false,
      autoSave: true
    }
  }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(defaultUsers[0]);

  useEffect(() => {
    const savedUser = localStorage.getItem('melani-current-user');
    if (savedUser) {
      const user = users.find(u => u.id === savedUser);
      if (user) setCurrentUser(user);
    }
  }, [users]);

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('melani-current-user', userId);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(users[0] || null);
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      switchUser,
      updateUser,
      addUser,
      removeUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
