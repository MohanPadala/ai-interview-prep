import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axiosInstance from "../utils/axiosInstance";
import { Plus, Trash2, ArrowRight, LogOut, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
    const { user, logout } = useContext(UserContext);
    const [sessions, setSessions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [jobRole, setJobRole] = useState("");
    const [experience, setExperience] = useState("");
    const [topicsToFocus, setTopicsToFocus] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Fetch all user sessions on mount
    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axiosInstance.get("/sessions");
            setSessions(res.data);
        } catch (error) {
            toast.error("Failed to load interview sessions");
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create the Session
            const sessionRes = await axiosInstance.post("/sessions", {
                jobRole,
                experience,
                topicsToFocus,
            });
            const newSessionId = sessionRes.data._id;

            toast.success("Session created! Generating AI questions...");

            // 2. Trigger Gemini AI Question Generation
            await axiosInstance.post(`/questions/generate/${newSessionId}`);

            setIsModalOpen(false);
            navigate(`/interview/${newSessionId}`);
        } catch (error) {
            toast.error("Error creating session or generating AI questions");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this session?")) return;
        try {
            await axiosInstance.delete(`/sessions/${id}`);
            setSessions(sessions.filter((s) => s._id !== id));
            toast.success("Session deleted");
        } catch (error) {
            toast.error("Failed to delete session");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Navbar Header */}
            <div className="flex justify-between items-center max-w-6xl mx-auto mb-8 bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name}</h1>
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Interview Sessions</h2>
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" /> New Session
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                        <div key={session._id} onClick={() => navigate(`/interview/${session._id}`)} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{session.experience}</span>
                                    <button onClick={(e) => handleDeleteSession(e, session._id)} className="text-gray-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{session.jobRole}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">Focus: {session.topicsToFocus}</p>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-sm text-gray-600">
                                <span>{session.questionsCount} Questions</span>
                                <span className="text-blue-600 font-medium flex items-center gap-1">Practice <ArrowRight className="w-4 h-4" /></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Session Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Create Interview Prep Session</h3>
                        <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                                <input type="text" required placeholder="e.g. MERN Stack Developer" value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="w-full p-2.5 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                                <input type="text" required placeholder="e.g. 2 Years / Fresher" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full p-2.5 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topics to Focus</label>
                                <input type="text" required placeholder="e.g. React Hooks, MongoDB Aggregation" value={topicsToFocus} onChange={(e) => setTopicsToFocus(e.target.value)} className="w-full p-2.5 border rounded-lg" />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? "Generating AI..." : "Create & Start"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}