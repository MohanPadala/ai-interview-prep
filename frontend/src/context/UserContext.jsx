import { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on page refresh
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await axiosInstance.get("/auth/profile");
                    setUser(response.data);
                } catch (error) {
                    console.error("Token invalid or expired");
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem("token", token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};