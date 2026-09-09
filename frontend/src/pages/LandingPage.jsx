import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

export default function LandingPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email, password } : { name, email, password };
            
            const response = await axiosInstance.post(endpoint, payload);
            
            login(response.data, response.data.token);
            toast.success(isLogin ? "Logged in successfully!" : "Account created!");
            navigate('/dashboard'); // Redirect to Dashboard
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6">
                    {isLogin ? 'Login to AI Prep' : 'Create an Account'}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" />
                    )}
                    <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 border rounded" />
                    <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 border rounded" />
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm cursor-pointer text-blue-600" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </p>
            </div>
        </div>
    );
}