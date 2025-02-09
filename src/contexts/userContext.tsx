'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { get } from "@/utils/api";

interface UserDetails {
    id: number;
    name: string;
    role: string;
    profile_photo_path: string;
}

interface UserContextType {
    user: UserDetails | null;
    loading: boolean;
    fetchUser: () => Promise<void>;
    setUser: (user: UserDetails | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            const response = await get<any>("/user");
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, fetchUser, setUser }}>
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