import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { ChevronDown, ChevronUp, Pin, Sparkles, ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function InterviewPrep() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [explainingId, setExplainingId] = useState(null);

    useEffect(() => {
        fetchSessionDetails();
        fetchQuestions();
    }, [id]);

    const fetchSessionDetails = async () => {
        try {
            const res = await axiosInstance.get(`/sessions/${id}`);
            setSession(res.data);
        } catch (error) {
            toast.error("Failed to fetch session details");
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await axiosInstance.get(`/questions/session/${id}`);
            setQuestions(res.data);
        } catch (error) {
            toast.error("Failed to load questions");
        }
    };

    const togglePin = async (questionId) => {
        try {
            const res = await axiosInstance.patch(`/questions/${questionId}/pin`);
            setQuestions(questions.map((q) => (q._id === questionId ? res.data : q)).sort((a, b) => b.isPinned - a.isPinned));
            toast.success("Pin status updated");
        } catch (error) {
            toast.error("Error updating pin");
        }
    };

    const handleExplainConcept = async (questionId) => {
        setExplainingId(questionId);
        try {
            const res = await axiosInstance.post(`/questions/${questionId}/explain`);
            setQuestions(questions.map((q) => (q._id === questionId ? { ...q, explanation: res.data.explanation } : q)));
            toast.success("AI explanation generated!");
        } catch (error) {
            toast.error("Failed to generate explanation");
        } finally {
            setExplainingId(null);
        }
    };

    const handleDeleteSession = async () => {
        if (!window.confirm("Delete this session and all its questions?")) return;
        try {
            await axiosInstance.delete(`/sessions/${id}`);
            toast.success("Session deleted");
            navigate("/dashboard");
        } catch (error) {
            toast.error("Failed to delete session");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
                        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                    </button>
                    <button onClick={handleDeleteSession} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm">
                        <Trash2 className="w-4 h-4" /> Delete Session
                    </button>
                </div>

                {/* Session Banner */}
                {session && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md mb-8">
                        <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">{session.experience}</span>
                        <h1 className="text-3xl font-bold mt-2">{session.jobRole}</h1>
                        <p className="text-blue-100 text-sm mt-1">Focus Topics: {session.topicsToFocus}</p>
                    </div>
                )}

                {/* Q&A Accordion List */}
                <div className="space-y-4">
                    {questions.map((item, index) => {
                        const isExpanded = expandedId === item._id;
                        return (
                            <div key={item._id} className={`bg-white rounded-xl shadow-sm border transition ${item.isPinned ? "border-amber-400 ring-1 ring-amber-400" : "border-gray-200"}`}>
                                <div onClick={() => setExpandedId(isExpanded ? null : item._id)} className="p-5 flex justify-between items-center cursor-pointer select-none">
                                    <div className="flex items-start gap-3 pr-4">
                                        <span className="text-blue-600 font-bold mt-0.5">Q{index + 1}.</span>
                                        <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={(e) => { e.stopPropagation(); togglePin(item._id); }} className={`p-1.5 rounded-lg ${item.isPinned ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`}>
                                            <Pin className="w-4 h-4" />
                                        </button>
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                                        <div className="mb-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Model Answer</h4>
                                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{item.answer}</p>
                                        </div>

                                        {item.explanation ? (
                                            <div className="mt-4 bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                                                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Sparkles className="w-3.5 h-3.5" /> AI Concept Breakdown
                                                </h4>
                                                <p className="text-indigo-900 text-sm whitespace-pre-line">{item.explanation}</p>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleExplainConcept(item._id)} disabled={explainingId === item._id} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5">
                                                <Sparkles className="w-4 h-4" /> {explainingId === item._id ? "Breaking down concept..." : "Explain Concept with AI"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}