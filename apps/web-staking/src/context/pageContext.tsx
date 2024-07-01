"use client";

import { createContext, useContext, useState } from 'react';

type SidebarContextType = {
    activePage: string;
    setActivePage: (page: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode}) => {
    const [activePage, setActivePage] = useState('/');

    return (
        <SidebarContext.Provider value={{ activePage, setActivePage }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};