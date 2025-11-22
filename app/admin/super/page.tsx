'use client';
import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    orderBy
} from 'firebase/firestore';
import {
    X,
    Check,
    Trash2,
    ExternalLink,
    BookOpen,
    MonitorPlay,
    LogOut,
    FileText,
    User as UserIcon,
    Youtube,
    Instagram,
    Twitter,
    Globe,
    AlertOctagon,
    Edit3,
    Search,
    Filter,
    Download,
    Upload,
    Shield
} from 'lucide-react';
import VideoPlayer from '@/app/components/VideoPlayer';
import { VideoData } from '@/lib/types';

// --- HELPER FOR SOCIAL ICONS ---
function SocialIcon({ platform }: { platform: string }) {
    const p = platform.toLowerCase();
    if (p.includes('youtube')) return <Youtube size={12} />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter size={12} />;
    if (p.includes('instagram')) return <Instagram size={12} />;
    return <Globe size={12} />;
}

// --- MAIN SUPER ADMIN PANEL ---
export default function SuperAdminPanel() {
    const [user, setUser] = useState<User | null>(null);
    const [allVideos, setAllVideos] = useState<VideoData[]>([]);
    const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
    const [inspecting, setInspecting] = useState<VideoData | null>(null);
    const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());



    // 1. Check Auth - MODIFIED VERSION
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u && u.email === 'saitama@hero.com') {
                setUser(u);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Fetch ALL Videos
    useEffect(() => {
        if (!user) return;

        const fetchAllVideos = async () => {
            const q = query(collection(db, "animations"), orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoData));
            setAllVideos(data);
            setFilteredVideos(data);
        };

        fetchAllVideos();
    }, [user]);

    // 3. Filter Videos
    useEffect(() => {
        let filtered = allVideos;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(video =>
                video.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.authorQuote?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(video => video.status === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(video => video.animationType === typeFilter);
        }

        setFilteredVideos(filtered);
    }, [searchTerm, statusFilter, typeFilter, allVideos]);

    // 4. Action Handlers
    const handleStatusUpdate = async (id: string, newStatus: VideoData['status']) => {
        if (!window.confirm(`Change status to ${newStatus}?`)) return;

        await updateDoc(doc(db, "animations", id), { status: newStatus });

        // Update local state
        setAllVideos(prev => prev.map(v =>
            v.id === id ? { ...v, status: newStatus } : v
        ));

        setInspecting(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Permanently delete this submission? This cannot be undone!")) return;

        await deleteDoc(doc(db, "animations", id));

        // Update local state
        setAllVideos(prev => prev.filter(v => v.id !== id));
        setSelectedVideos(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        setInspecting(null);
    };

    const handleBulkDelete = async () => {
        if (selectedVideos.size === 0) return;
        if (!window.confirm(`Permanently delete ${selectedVideos.size} submissions? This cannot be undone!`)) return;

        const deletePromises = Array.from(selectedVideos).map(id =>
            deleteDoc(doc(db, "animations", id))
        );

        await Promise.all(deletePromises);

        // Update local state
        setAllVideos(prev => prev.filter(v => !selectedVideos.has(v.id!)));
        setSelectedVideos(new Set());
    };

    const handleBulkStatusUpdate = async (newStatus: VideoData['status']) => {
        if (selectedVideos.size === 0) return;
        if (!window.confirm(`Set status to ${newStatus} for ${selectedVideos.size} submissions?`)) return;

        const updatePromises = Array.from(selectedVideos).map(id =>
            updateDoc(doc(db, "animations", id), { status: newStatus })
        );

        await Promise.all(updatePromises);

        // Update local state
        setAllVideos(prev => prev.map(v =>
            selectedVideos.has(v.id!) ? { ...v, status: newStatus } : v
        ));
        setSelectedVideos(new Set());
    };

    const handleSaveEdit = async (videoData: VideoData) => {
        if (!editingVideo?.id) return;

        const { id, ...updateData } = videoData;
        await updateDoc(doc(db, "animations", editingVideo.id), updateData);

        // Update local state
        setAllVideos(prev => prev.map(v =>
            v.id === editingVideo.id ? { ...v, ...updateData } : v
        ));
        setEditingVideo(null);
        setInspecting(null);
    };

    const toggleSelectVideo = (id: string) => {
        setSelectedVideos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const selectAll = () => {
        if (selectedVideos.size === filteredVideos.length) {
            setSelectedVideos(new Set());
        } else {
            setSelectedVideos(new Set(filteredVideos.map(v => v.id!)));
        }
    };

    // Logout
    const handleLogout = () => auth.signOut();

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center font-black bg-red-600">
            <div className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_black] animate-pulse">
                <p className="text-xl uppercase">Verifying One-Punch Access...</p>
            </div>
        </div>
    );

    if (!user) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_#000] p-8 md:p-12 max-w-md text-center">
                <div className="text-6xl mb-4">💥</div>
                <h1 className="text-3xl font-black italic uppercase text-red-600 mb-4">
                    Access Denied
                </h1>
                <p className="font-bold text-gray-700 mb-4">
                    Super Admin clearance requires Saitama-level authorization.
                </p>
                <p className="text-sm text-gray-500">
                    Only saitama@hero.com can access this panel.
                </p>
                <button
                    onClick={() => window.location.href = '/admin'}
                    className="mt-6 bg-black text-white px-6 py-3 border-2 border-black font-black uppercase hover:bg-gray-800 transition"
                >
                    Go to Moderator Panel
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">

            {/* --- HEADER BAR --- */}
            <div className="bg-white border-b-4 border-black sticky top-0 z-30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-black italic uppercase flex items-center gap-1 tracking-tight">
                            <Shield className="text-red-600" size={28} />
                            SUPER <span className="bg-red-600 text-white px-2 border-2 border-black shadow-[2px_2px_0px_black]">ADMIN</span>
                        </h1>
                        <span className="text-xs font-black bg-black text-white px-2 py-1 border border-black">
                            {allVideos.length} Total
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wider border-2 border-black flex gap-2 items-center">
                            <AlertOctagon size={14} className="text-yellow-400" />
                            <span>Selected: {selectedVideos.size}</span>
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

            {/* --- CONTROLS BAR --- */}
            <div className="bg-yellow-400 border-b-4 border-black p-4 sticky top-[68px] z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">

                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search creators, descriptions..."
                            className="w-full pl-10 pr-4 py-2 border-2 border-black bg-white font-bold placeholder-gray-400 outline-none focus:bg-yellow-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <select
                            className="border-2 border-black bg-white px-3 py-2 font-bold text-sm outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved_canon">Approved Canon</option>
                            <option value="approved_fan">Approved Fan</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            className="border-2 border-black bg-white px-3 py-2 font-bold text-sm outline-none"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="canon">Canon</option>
                            <option value="fan">Fan</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedVideos.size > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBulkStatusUpdate('approved_canon')}
                                className="bg-green-600 text-white px-3 py-2 border-2 border-black font-black text-xs uppercase hover:bg-green-700 transition"
                            >
                                Approve Canon
                            </button>
                            <button
                                onClick={() => handleBulkStatusUpdate('approved_fan')}
                                className="bg-yellow-400 text-black px-3 py-2 border-2 border-black font-black text-xs uppercase hover:bg-yellow-300 transition"
                            >
                                Approve Fan
                            </button>
                            <button
                                onClick={() => handleBulkStatusUpdate('rejected')}
                                className="bg-red-600 text-white px-3 py-2 border-2 border-black font-black text-xs uppercase hover:bg-red-700 transition"
                            >
                                Reject
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="bg-black text-white px-3 py-2 border-2 border-black font-black text-xs uppercase hover:bg-red-800 transition"
                            >
                                Delete ({selectedVideos.size})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- VIDEO GRID --- */}
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-70">
                        <div className="bg-gray-100 p-6 rounded-full border-4 border-gray-400 mb-6">
                            <Search size={64} className="text-gray-400" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tight">No Results Found</h2>
                        <p className="text-lg font-bold text-gray-500 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video) => (
                            <div key={video.id} className={`bg-white border-4 ${getStatusBorderColor(video.status)} shadow-[6px_6px_0px_rgba(0,0,0,0.1)] p-5 relative hover:-translate-y-1 transition-all duration-200 flex flex-col h-full`}>

                                {/* Selection Checkbox */}
                                <div className="absolute -top-2 -left-2 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedVideos.has(video.id!)}
                                        onChange={() => toggleSelectVideo(video.id!)}
                                        className="w-5 h-5 border-2 border-black bg-white checked:bg-red-600"
                                    />
                                </div>

                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-gray-100">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[10px] font-black px-2 py-1 border border-black uppercase tracking-wider ${getStatusBadgeColor(video.status)}`}>
                                            {video.status}
                                        </span>
                                        <span className={`text-[10px] font-black px-2 py-1 border border-black uppercase tracking-wider ${video.animationType === 'canon' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black'}`}>
                                            {video.animationType}
                                        </span>
                                    </div>
                                    <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        CH. {video.chapterStart}-{video.chapterEnd}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="mb-6 flex-1">
                                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-1">Creator</h3>
                                    <p className="font-black text-xl leading-none mb-4 line-clamp-1">{video.creatorName || "Unknown"}</p>

                                    {/* Author Quote */}
                                    {video.authorQuote && video.authorQuote.trim() !== '' && (
                                        <div className="mb-3">
                                            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-1">Author Quote</h3>
                                            <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed italic bg-yellow-50 p-2 rounded border border-yellow-200">
                                                "{video.authorQuote}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="mb-3">
                                        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-1">Description</h3>
                                        <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed italic bg-gray-50 p-2 rounded border border-gray-200">
                                            "{video.description || 'No description provided.'}"
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-4 text-xs font-bold text-gray-500">
                                        <span>Likes: {video.likes || 0}</span>
                                        <span>Posted: {new Date(video.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setInspecting(video)}
                                        className="flex-1 bg-black text-white font-black uppercase py-2 border-2 border-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-xs"
                                    >
                                        <MonitorPlay size={14} /> Inspect
                                    </button>
                                    <button
                                        onClick={() => setEditingVideo(video)}
                                        className="bg-blue-600 text-white p-2 border-2 border-black hover:bg-blue-700 transition"
                                        title="Edit"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(video.id!)}
                                        className="bg-red-600 text-white p-2 border-2 border-black hover:bg-red-700 transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- FULL SCREEN INSPECTOR --- */}
            {inspecting && (
                <InspectorModal
                    video={inspecting}
                    onClose={() => setInspecting(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                    onEdit={() => setEditingVideo(inspecting)}
                />
            )}

            {/* --- EDIT MODAL --- */}
            {editingVideo && (
                <EditModal
                    video={editingVideo}
                    onClose={() => setEditingVideo(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
}

// --- HELPER FUNCTIONS ---
function getStatusBorderColor(status: string): string {
    switch (status) {
        case 'approved_canon': return 'border-green-500';
        case 'approved_fan': return 'border-yellow-400';
        case 'rejected': return 'border-red-500';
        case 'pending': return 'border-blue-400';
        default: return 'border-gray-400';
    }
}

function getStatusBadgeColor(status: string): string {
    switch (status) {
        case 'approved_canon': return 'bg-green-500 text-white';
        case 'approved_fan': return 'bg-yellow-400 text-black';
        case 'rejected': return 'bg-red-500 text-white';
        case 'pending': return 'bg-blue-400 text-white';
        default: return 'bg-gray-400 text-white';
    }
}

// --- INSPECTOR MODAL COMPONENT ---
function InspectorModal({
    video,
    onClose,
    onStatusUpdate,
    onDelete,
    onEdit
}: {
    video: VideoData;
    onClose: () => void;
    onStatusUpdate: (id: string, status: VideoData['status']) => void;
    onDelete: (id: string) => void;
    onEdit: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 animate-in fade-in duration-200">
            {/* MODAL NAVBAR */}
            <div className="h-16 bg-white border-b-4 border-black flex justify-between items-center px-4 md:px-8 shrink-0 z-20 shadow-lg">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Super Admin View</span>
                    <h2 className="font-black italic text-xl md:text-2xl uppercase text-red-600 tracking-tighter">
                        #{video.id!.slice(0, 8)}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white border-2 border-black hover:bg-blue-700 transition font-bold uppercase text-xs tracking-widest"
                    >
                        <Edit3 size={14} /> Edit
                    </button>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-black hover:text-white border-2 border-black transition font-bold uppercase text-xs tracking-widest"
                    >
                        <span className="hidden md:inline">Close</span>
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* CONTENT AREA - Reuse your existing inspector content */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
                {/* LEFT PANEL: VIDEO & METADATA */}
                <div className="w-full md:w-[45%] bg-gray-50 border-r-4 border-black flex flex-col overflow-y-auto">
                    <VideoPlayer url={video.videoLink} />
                    <div className="p-6 space-y-6 pb-20">
                        {/* Creator Profile */}
                        <div className="bg-white border-2 border-black shadow-[5px_5px_0px_#facc15] p-5">
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                                <UserIcon size={16} className="text-red-600" /> Creator Profile
                            </h4>
                            <div className="mb-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Name / Handle</span>
                                <p className="text-2xl font-black italic">{video.creatorName}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Connected Accounts</span>
                                <div className="flex flex-wrap gap-2">
                                    {video.authorLinks?.map((l: any, i: number) => (
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
                                    <span className="font-mono font-bold text-lg bg-yellow-100 px-1">{video.chapterStart} - {video.chapterEnd}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Submitted At</span>
                                    <span className="font-mono font-bold text-xs">{new Date(video.timestamp).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Requested Type</span>
                                    <span className="font-bold uppercase text-xs">{video.animationType}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Video URL</span>
                                    <a href={video.videoLink} target="_blank" className="text-[10px] underline text-blue-600 truncate block">Open Link</a>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Likes</span>
                                    <span className="font-bold text-xs">{video.likes || 0}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Status</span>
                                    <span className={`font-bold uppercase text-xs ${getStatusBadgeColor(video.status)} px-2 py-1`}>
                                        {video.status}
                                    </span>
                                </div>
                            </div>

                            {/* Author Quote */}
                            {video.authorQuote && video.authorQuote.trim() !== '' && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Author Quote</span>
                                    <p className="text-sm italic bg-yellow-50 p-3 border border-yellow-300 rounded leading-relaxed text-gray-700">
                                        "{video.authorQuote}"
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Description / Comment</span>
                                <p className="text-sm italic bg-gray-50 p-3 border border-gray-300 rounded leading-relaxed text-gray-700">
                                    "{video.description}"
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
                            href={`https://cubari.moe/read/gist/OPM/${video.chapterStart}/1/`}
                            target="_blank"
                            className="font-bold text-[10px] uppercase border-2 border-black bg-white px-2 py-0.5 hover:bg-black hover:text-white transition"
                        >
                            Open Cubari.moe
                        </a>
                    </div>
                    <div className="flex-1 bg-white relative">
                        <iframe
                            src={`https://cubari.moe/read/gist/OPM/${video.chapterStart}/1/`}
                            className="absolute inset-0 w-full h-full border-none"
                            title="Manga Reference"
                        />
                    </div>
                </div>
            </div>

            {/* BOTTOM ACTIONS BAR */}
            <div className="bg-white border-t-4 border-black p-4 md:p-5 shrink-0 z-30">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 font-black text-sm uppercase">
                    <button
                        onClick={() => onDelete(video.id!)}
                        className="md:w-1/4 bg-white text-red-600 border-4 border-red-600 py-4 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 group"
                    >
                        <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
                        DELETE PERMANENTLY
                    </button>

                    <div className="md:w-3/4 flex gap-4">
                        <button
                            onClick={() => onStatusUpdate(video.id!, 'rejected')}
                            className="flex-1 bg-red-500 text-white border-4 border-black py-4 hover:bg-red-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            REJECT
                        </button>
                        <button
                            onClick={() => onStatusUpdate(video.id!, 'pending')}
                            className="flex-1 bg-blue-500 text-white border-4 border-black py-4 hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            SET PENDING
                        </button>
                        <button
                            onClick={() => onStatusUpdate(video.id!, 'approved_fan')}
                            className="flex-1 bg-yellow-400 text-black border-4 border-black py-4 hover:bg-yellow-300 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            APPROVE FAN
                        </button>
                        <button
                            onClick={() => onStatusUpdate(video.id!, 'approved_canon')}
                            className="flex-1 bg-green-600 text-white border-4 border-black py-4 hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            APPROVE CANON
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- EDIT MODAL COMPONENT ---
function EditModal({ video, onClose, onSave }: { video: VideoData; onClose: () => void; onSave: (video: VideoData) => void }) {
    const [formData, setFormData] = useState<VideoData>(video);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_black] w-full max-w-2xl mx-4">
                <div className="bg-red-600 text-white p-4 border-b-4 border-black">
                    <h2 className="text-2xl font-black italic uppercase">Edit Submission</h2>
                    <p className="text-sm font-bold">Modify any field below</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Creator Name */}
                    <div>
                        <label className="block font-black text-xs uppercase mb-1">Creator Name</label>
                        <input
                            type="text"
                            value={formData.creatorName}
                            onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                            className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600"
                        />
                    </div>

                    {/* Video Link */}
                    <div>
                        <label className="block font-black text-xs uppercase mb-1">Video URL</label>
                        <input
                            type="url"
                            value={formData.videoLink}
                            onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                            className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600"
                        />
                    </div>

                    {/* Chapters */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-black text-xs uppercase mb-1">Start Chapter</label>
                            <input
                                type="number"
                                value={formData.chapterStart}
                                onChange={(e) => setFormData({ ...formData, chapterStart: Number(e.target.value) })}
                                className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600"
                            />
                        </div>
                        <div>
                            <label className="block font-black text-xs uppercase mb-1">End Chapter</label>
                            <input
                                type="number"
                                value={formData.chapterEnd}
                                onChange={(e) => setFormData({ ...formData, chapterEnd: Number(e.target.value) })}
                                className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600"
                            />
                        </div>
                    </div>

                    {/* Animation Type */}
                    <div>
                        <label className="block font-black text-xs uppercase mb-1">Animation Type</label>
                        <select
                            value={formData.animationType}
                            onChange={(e) => setFormData({ ...formData, animationType: e.target.value as 'canon' | 'fan' })}
                            className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600"
                        >
                            <option value="canon">Canon</option>
                            <option value="fan">Fan</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block font-black text-xs uppercase mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as VideoData['status'] })}
                            className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600"
                        >
                            <option value="pending">Pending</option>
                            <option value="approved_canon">Approved Canon</option>
                            <option value="approved_fan">Approved Fan</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Author Quote */}
                    <div>
                        <label className="block font-black text-xs uppercase mb-1">Author Quote</label>
                        <textarea
                            value={formData.authorQuote || ''}
                            onChange={(e) => setFormData({ ...formData, authorQuote: e.target.value })}
                            className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600 h-20 resize-none"
                            placeholder="Creator's quote..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block font-black text-xs uppercase mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600 h-20 resize-none"
                            placeholder="Description..."
                        />
                    </div>

                    {/* Likes */}
                    <div>
                        <label className="block font-black text-xs uppercase mb-1">Likes Count</label>
                        <input
                            type="number"
                            value={formData.likes || 0}
                            onChange={(e) => setFormData({ ...formData, likes: Number(e.target.value) })}
                            className="w-full p-3 border-2 border-black bg-white font-bold outline-none focus:border-red-600"
                        />
                    </div>
                </form>

                <div className="p-4 border-t-4 border-black bg-gray-100 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-400 text-white py-3 border-2 border-black font-black uppercase hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-green-600 text-white py-3 border-2 border-black font-black uppercase hover:bg-green-700 transition"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- LOGIN SCREEN ---
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
            setError("Super Admin Authentication Failed.");
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 relative overflow-hidden">
            <div className="absolute w-[150%] h-64 bg-red-600 -rotate-6 -z-0 border-y-8 border-black top-1/4"></div>

            <div className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_#000] p-8 md:p-12 relative z-10">
                <div className="text-center mb-8">
                    <Shield className="mx-auto mb-4 text-red-600" size={48} />
                    <h1 className="text-6xl font-black italic leading-none mb-2">SUPER <span className="text-red-600">ADMIN</span></h1>
                    <div className="bg-black text-white inline-block px-4 py-1 font-bold uppercase tracking-widest text-xs -skew-x-12 border-2 border-red-600">
                        Highest Clearance Required
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase ml-1 mb-1 block">Super Admin ID</label>
                        <input
                            value={email} onChange={e => setEmail(e.target.value)} type="email"
                            className="w-full p-4 border-4 border-black outline-none focus:border-red-600 focus:bg-red-50 transition font-bold"
                            placeholder="superadmin@hero.com"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase ml-1 mb-1 block">Master Key</label>
                        <input
                            value={pass} onChange={e => setPass(e.target.value)} type="password"
                            className="w-full p-4 border-4 border-black outline-none focus:border-red-600 focus:bg-red-50 transition font-bold"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-600 font-black text-center p-3 border-2 border-red-600 text-xs uppercase">
                            {error}
                        </div>
                    )}

                    <button disabled={loading} className="w-full bg-black text-white border-4 border-black py-4 font-black text-xl uppercase hover:bg-red-600 hover:border-red-600 hover:scale-[1.02] transition-all shadow-[6px_6px_0px_#dc2626]">
                        {loading ? 'Verifying Clearance...' : 'Access System'}
                    </button>
                </form>
            </div>
        </div>
    );
}