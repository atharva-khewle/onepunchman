'use client';
import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { X, Check, Trash2, ExternalLink, BookOpen, MonitorPlay, LogOut, PlayCircle, FileText, User as UserIcon, Youtube, Instagram, Twitter, Globe, AlertOctagon } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';



// --- HELPER FOR SOCIAL ICONS ---
function SocialIcon({ platform }: { platform: string }) {
    const p = platform.toLowerCase();
    if (p.includes('youtube')) return <Youtube size={12} />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter size={12} />;
    if (p.includes('instagram')) return <Instagram size={12} />;
    return <Globe size={12} />;
}

// --- MAIN ADMIN PANEL ---
export default function AdminPanel() {
    const [user, setUser] = useState<User | null>(null);
    const [pendingVideos, setPendingVideos] = useState<any[]>([]);
    const [inspecting, setInspecting] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Check Auth
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Fetch Pending Items
    useEffect(() => {
        if (!user) return;

        const fetchPending = async () => {
            const q = query(collection(db, "animations"), where("status", "==", "pending"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingVideos(data);
        };

        fetchPending();
    }, [user]);

    // 3. Action Handler
    const handleAction = async (id: string, action: "approve_canon" | "approve_fan" | "reject") => {
        if (!window.confirm("Confirm this decision? It cannot be easily undone.")) return;

        const statusMap = {
            approve_canon: "approved_canon",
            approve_fan: "approved_fan",
            reject: "rejected"
        };

        // Update Firestore
        await updateDoc(doc(db, "animations", id), { status: statusMap[action] });

        // Remove from local state
        setPendingVideos(prev => prev.filter(v => v.id !== id));
        setInspecting(null);
    };

    // Logout
    const handleLogout = () => auth.signOut();

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center font-black bg-yellow-400">
            <div className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_black] animate-pulse">
                <p className="text-xl uppercase">Contacting Hero HQ...</p>
            </div>
        </div>
    );

    if (!user) return <LoginForm />;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">

            {/* --- HEADER BAR --- */}
            <div className="bg-white border-b-4 border-black sticky top-0 z-30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black italic uppercase flex items-center gap-1 tracking-tight">
                            HERO <span className="bg-yellow-400 px-2 border-2 border-black text-black shadow-[2px_2px_0px_black]">HQ</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-black text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wider border-2 border-black flex gap-2 items-center">
                            <AlertOctagon size={14} className="text-yellow-400" />
                            <span>Queue: {pendingVideos.length}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-white border-2 border-black p-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-[2px_2px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- EMPTY STATE OR LIST --- */}
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {pendingVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-70">
                        <div className="bg-green-100 p-6 rounded-full border-4 border-green-600 mb-6 shadow-[4px_4px_0px_rgba(0,128,0,0.3)]">
                            <Check size={64} className="text-green-600" strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tight">All Systems Clear</h2>
                        <p className="text-lg font-bold text-gray-500 mt-2">The Monster Association is quiet... for now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingVideos.map(v => (
                            <div key={v.id} className="bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.1)] p-5 relative hover:-translate-y-1 hover:shadow-[10px_10px_0px_rgba(220,38,38,1)] transition-all duration-200 flex flex-col h-full">

                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-gray-100">
                                    <span className={`text-[10px] font-black px-2 py-1 border border-black uppercase tracking-wider ${v.animationType === 'canon' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black'}`}>
                                        {v.animationType}
                                    </span>
                                    <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        CH. {v.chapterStart}-{v.chapterEnd}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="mb-6 flex-1">
                                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-1">Uploaded By</h3>
                                    <p className="font-black text-xl leading-none mb-4 line-clamp-1">{v.creatorName || "Unknown"}</p>

                                    {/* Author Quote */}
                                    {v.authorQuote && v.authorQuote.trim() !== '' && (
                                        <div className="mb-3">
                                            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-1">Author Quote</h3>
                                            <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed italic bg-yellow-50 p-2 rounded border border-yellow-200">
                                                "{v.authorQuote}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="mb-3">
                                        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-1">Description</h3>
                                        <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed italic bg-gray-50 p-2 rounded border border-gray-200">
                                            "{v.description || 'No description provided.'}"
                                        </p>
                                    </div>                                </div>

                                {/* Action */}
                                <button
                                    onClick={() => setInspecting(v)}
                                    className="w-full bg-black text-white font-black uppercase py-3 border-2 border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_black] transition-all flex items-center justify-center gap-2 tracking-widest text-sm"
                                >
                                    <MonitorPlay size={16} /> Review Submission
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- FULL SCREEN INSPECTOR --- */}
            {inspecting && (
                <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 animate-in fade-in duration-200">

                    {/* MODAL NAVBAR */}
                    <div className="h-16 bg-white border-b-4 border-black flex justify-between items-center px-4 md:px-8 shrink-0 z-20 shadow-lg">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Case ID</span>
                            <h2 className="font-black italic text-xl md:text-2xl uppercase text-red-600 tracking-tighter">
                                #{inspecting.id.slice(0, 6)}
                            </h2>
                        </div>
                        <button
                            onClick={() => setInspecting(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-black hover:text-white border-2 border-black transition font-bold uppercase text-xs tracking-widest"
                        >
                            <span className="hidden md:inline">Close Panel</span>
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {/* CONTENT AREA (Split View) */}
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">

                        {/* LEFT PANEL: VIDEO & METADATA */}
                        <div className="w-full md:w-[45%] bg-gray-50 border-r-4 border-black flex flex-col overflow-y-auto custom-scrollbar">

                            {/* Player */}
                            <VideoPlayer url={inspecting.videoLink} />

                            <div className="p-6 space-y-6 pb-20">

                                {/* Creator Profile */}
                                <div className="bg-white border-2 border-black shadow-[5px_5px_0px_#facc15] p-5">
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                                        <UserIcon size={16} className="text-red-600" /> Creator Profile
                                    </h4>

                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Name / Handle</span>
                                        <p className="text-2xl font-black italic">{inspecting.creatorName}</p>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Connected Accounts</span>
                                        <div className="flex flex-wrap gap-2">
                                            {inspecting.authorLinks?.map((l: any, i: number) => (
                                                <a key={i} href={l.url} target="_blank" className="text-[10px] font-bold uppercase bg-black text-white border border-black px-3 py-1 hover:bg-red-600 transition flex items-center gap-2">
                                                    <SocialIcon platform={l.platform} />
                                                    {l.platform}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Submission Data */}
                                <div className="bg-white border-2 border-black shadow-[5px_5px_0px_#e5e7eb] p-5">
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                                        <FileText size={16} className="text-blue-600" /> Technical Data
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold block">Chapter Range</span>
                                            <span className="font-mono font-bold text-lg bg-yellow-100 px-1">{inspecting.chapterStart} - {inspecting.chapterEnd}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold block">Submitted At</span>
                                            <span className="font-mono font-bold text-xs">{new Date(inspecting.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold block">Requested Type</span>
                                            <span className="font-bold uppercase text-xs">{inspecting.animationType}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold block">Video URL</span>
                                            <a href={inspecting.videoLink} target="_blank" className="text-[10px] underline text-blue-600 truncate block">Open Link</a>
                                        </div>
                                    </div>

                                    {/* Author Quote in Inspector */}
                                    {inspecting.authorQuote && inspecting.authorQuote.trim() !== '' && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Author Quote</span>
                                            <p className="text-sm italic bg-yellow-50 p-3 border border-yellow-300 rounded leading-relaxed text-gray-700">
                                                "{inspecting.authorQuote}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Description in Inspector */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Description / Comment</span>
                                        <p className="text-sm italic bg-gray-50 p-3 border border-gray-300 rounded leading-relaxed text-gray-700">
                                            "{inspecting.description}"
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* RIGHT PANEL: MANGA READER SOURCE */}
                        <div className="w-full md:w-[55%] bg-gray-200 flex flex-col relative h-[400px] md:h-auto border-t-4 md:border-t-0 border-black">
                            <div className="h-12 bg-yellow-400 border-b-4 border-black flex justify-between items-center px-4 shrink-0">
                                <span className="font-black text-xs uppercase flex items-center gap-2 text-black tracking-wide">
                                    <BookOpen size={16} /> Source Verification
                                </span>
                                <a
                                    href={`https://cubari.moe/read/gist/OPM/${inspecting.chapterStart}/1/`}
                                    target="_blank"
                                    className="font-bold text-[10px] uppercase border-2 border-black bg-white px-2 py-0.5 hover:bg-black hover:text-white transition"
                                >
                                    Open Cubari.moe
                                </a>
                            </div>

                            <div className="flex-1 bg-white relative">
                                <iframe
                                    src={`https://cubari.moe/read/gist/OPM/${inspecting.chapterStart}/1/`}
                                    className="absolute inset-0 w-full h-full border-none"
                                    title="Manga Reference"
                                />
                                {/* Interaction Blocker overlay to allow scrolling but warn it is an iframe */}
                                <div className="absolute top-2 right-6 bg-black/50 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
                                    Preview Mode
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* BOTTOM ACTIONS BAR */}
                    <div className="bg-white border-t-4 border-black p-4 md:p-5 shrink-0 z-30">
                        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 font-black text-sm uppercase">

                            <button
                                onClick={() => handleAction(inspecting.id, 'reject')}
                                className="md:w-1/4 bg-white text-red-600 border-4 border-red-600 py-4 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 group"
                            >
                                <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
                                REJECT
                            </button>

                            <div className="md:w-3/4 flex gap-4">
                                <button
                                    onClick={() => handleAction(inspecting.id, 'approve_fan')}
                                    className="flex-1 bg-yellow-400 text-black border-4 border-black py-4 hover:bg-yellow-300 hover:-translate-y-1 hover:shadow-[5px_5px_0px_black] transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    APPROVE (FAN)
                                </button>

                                <button
                                    onClick={() => handleAction(inspecting.id, 'approve_canon')}
                                    className="flex-1 bg-black text-white border-4 border-black py-4 hover:bg-green-600 hover:border-green-600 hover:-translate-y-1 hover:shadow-[5px_5px_0px_gray] transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    APPROVE (CANON)
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

// --- LOGIN SCREEN (UNCHANGED STYLING) ---
function LoginForm() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (err) {
            setLoading(false);
            setError("Authentication Failed.");
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 relative overflow-hidden">
            <div className="absolute w-[150%] h-64 bg-yellow-400 -rotate-6 -z-0 border-y-8 border-black top-1/4"></div>

            <div className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_#dc2626] p-8 md:p-12 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-black italic leading-none mb-2">HQ <span className="text-red-600">LOGIN</span></h1>
                    <div className="bg-black text-white inline-block px-4 py-1 font-bold uppercase tracking-widest text-xs -skew-x-12 border-2 border-red-600">
                        Authorized Personnel Only
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase ml-1 mb-1 block">Identifier</label>
                        <input
                            value={email} onChange={e => setEmail(e.target.value)} type="email"
                            className="w-full p-4 border-4 border-black outline-none focus:border-yellow-400 focus:bg-yellow-50 transition font-bold"
                            placeholder="admin@hero.com"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase ml-1 mb-1 block">Security Key</label>
                        <input
                            value={pass} onChange={e => setPass(e.target.value)} type="password"
                            className="w-full p-4 border-4 border-black outline-none focus:border-yellow-400 focus:bg-yellow-50 transition font-bold"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-600 font-black text-center p-3 border-2 border-red-600 text-xs uppercase">
                            {error}
                        </div>
                    )}

                    <button disabled={loading} className="w-full bg-black text-white border-4 border-black py-4 font-black text-xl uppercase hover:bg-red-600 hover:border-red-600 hover:scale-[1.02] transition-all shadow-[6px_6px_0px_#fbbf24]">
                        {loading ? 'Scanning Retinas...' : 'Grant Access'}
                    </button>
                </form>
            </div>
        </div>
    );
}