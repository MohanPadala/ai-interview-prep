import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserProvider, UserContext } from "./context/UserContext";
import { useContext } from "react";
import Dashboard from "./pages/Dashboard";
import InterviewPrep from "./pages/InterviewPrep";
import LandingPage from "./pages/LandingPage";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(UserContext);
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    return user ? children : <Navigate to="/" />;
};

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/interview/:id" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;