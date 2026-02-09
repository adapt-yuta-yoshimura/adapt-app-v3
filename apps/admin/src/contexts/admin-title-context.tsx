'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

const AdminTitleContext = createContext<{
  title: string;
  setTitle: (title: string) => void;
}>({ title: '管理画面', setTitle: () => {} });

export function AdminTitleProvider({ children }: { children: ReactNode }): React.ReactNode {
  const [title, setTitleState] = useState('管理画面');
  const setTitle = useCallback((t: string) => setTitleState(t), []);
  return (
    <AdminTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </AdminTitleContext.Provider>
  );
}

export function useAdminTitle(): (title: string) => void {
  const { setTitle } = useContext(AdminTitleContext);
  return setTitle;
}

export function useAdminTitleValue(): string {
  const { title } = useContext(AdminTitleContext);
  return title;
}
