'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Heart, Youtube, Twitter, Instagram, Globe, Share2, MessageCircle, Flame } from 'lucide-react';
import { VideoData } from '@/lib/types';
import VideoPlayer from '@/app/components/VideoPlayer';

// Helper for specific Social Icons
const SocialBadge = ({ platform, url }: { platform: string, url: string }) => {
    const p = platform.toLowerCase();
    let Icon = Globe;
    let colorClass = "hover:text-gray-600";

    if (p.includes('youtube')) { Icon = Youtube; colorClass = "hover:text-red-600"; }
    else if (p.includes('twitter') || p.includes('x')) { Icon = Twitter; colorClass = "hover:text-blue-400"; }
    else if (p.includes('instagram')) { Icon = Instagram; colorClass = "hover:text-pink-500"; }
    else if (p.includes('patreon')) { Icon = Flame; colorClass = "hover:text-orange-500"; }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-1 text-[10px] font-black uppercase border-2 border-black px-2 py-1 bg-white text-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_gray] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]`}
        >
            <Icon size={12} className={`transition-colors ${colorClass} group-hover:text-white`} />
            <span>{platform}</span>
        </a>
    );
};

export default function FanPage() {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchVideos = async () => {
            // 1. Simple Fetch (Fan Content Only)
            const q = query(
                collection(db, "animations"),
                where("status", "==", "approved_fan")
            );

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoData));

            // 2. Client-Side Sort (Newest First)
            data.sort((a, b) => b.timestamp - a.timestamp);

            setVideos(data);
        };
        fetchVideos();
    }, []);

    // --- Handle Likes ---
    const handleLike = async (id: string, currentLikes: number) => {
        if (!id) return;

        // Prevent double liking locally (simple session check)
        if (likedVideos.has(id)) return;

        // 1. Optimistic UI Update
        setVideos(prev => prev.map(v =>
            v.id === id ? { ...v, likes: (v.likes || 0) + 1 } : v
        ));

        setLikedVideos(prev => new Set(prev).add(id));

        // 2. Update Database
        const vidRef = doc(db, "animations", id);
        await updateDoc(vidRef, {
            likes: increment(1)
        });
    };

    const handleShare = (video: VideoData) => {
        if (navigator.share) {
            navigator.share({
                title: `Watch ${video.creatorName}'s animation on OPM Fans`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert("Link copied to clipboard!");
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-20 font-sans">

            {/* --- HERO HEADER --- */}
            <div className="bg-yellow-400 border-b-4 border-black py-10 mb-8 md:mb-12 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/comic-dots.png')] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-black drop-shadow-[4px_4px_0px_white] mb-2">
                        The Fanverse
                    </h1>
                    <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-xs md:text-sm">
                        <span className="bg-black text-white px-3 py-1 border-2 border-white transform -skew-x-12">
                            {videos.length} Submissions
                        </span>
                        <span className="text-gray-800">
                            Community Made • Unfiltered Passion
                        </span>
                    </div>
                </div>
            </div>

            {/* --- VIDEO GRID --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {videos.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <div className="text-6xl mb-4 grayscale">🦗</div>
                        <h2 className="text-2xl font-black uppercase">It's quiet... too quiet.</h2>
                        <p className="font-bold">Be the first to upload an animation.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map((video) => (
                        <div key={video.id} className="bg-white border-4 border-black shadow-[8px_8px_0px_#e5e5e5] hover:shadow-[8px_8px_0px_#ef4444] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative group">

                            {/* Creator Badge (Overhanging) */}
                            <div className="absolute -top-4 left-4 z-20 bg-red-600 text-white px-3 py-1 border-2 border-black font-black text-xs uppercase italic tracking-wider transform -rotate-2 shadow-[2px_2px_0px_black] group-hover:rotate-0 transition-transform">
                                Art by {video.creatorName || 'Unknown'}
                            </div>

                            {/* Video Container */}
                            <div className="border-b-4 border-black bg-black">
                                <VideoPlayer url={video.videoLink} />
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex flex-col flex-1">

                                {/* Socials Row */}
                                <div className="flex flex-wrap gap-2 mb-4 pt-1">
                                    {video.authorLinks?.map((link: any, i: number) => (
                                        <SocialBadge key={i} platform={link.platform} url={link.url} />
                                    ))}
                                </div>

                                {/* Description */}
                                <div className="mb-6 flex-1 relative">
                                    {/* Quote mark for style */}
                                    <span className="absolute -top-2 -left-2 text-4xl font-serif text-gray-200 leading-none select-none">“</span>
                                    <p className="text-sm font-bold text-gray-700 leading-relaxed italic relative z-10 line-clamp-3">
                                        {video.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Footer Actions */}
                                <div className="pt-4 border-t-2 border-gray-100 flex justify-between items-end">

                                    {/* Date */}
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Posted {formatDistanceToNow(video.timestamp)} ago
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex items-center gap-2">
                                        {/* Share */}
                                        <button
                                            onClick={() => handleShare(video)}
                                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                                            title="Share"
                                        >
                                            <Share2 size={18} strokeWidth={2.5} />
                                        </button>

                                        {/* LIKE BUTTON */}
                                        <button
                                            onClick={() => handleLike(video.id!, video.likes)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border-2 font-black uppercase text-xs tracking-wider transition-all shadow-[2px_2px_0px_black] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] ${likedVideos.has(video.id!)
                                                ? 'bg-red-100 text-red-600 border-red-600'
                                                : 'bg-yellow-400 text-black border-black hover:bg-yellow-300'
                                                }`}
                                        >
                                            <Heart
                                                size={14}
                                                className={likedVideos.has(video.id!) ? 'fill-current' : ''}
                                                strokeWidth={3}
                                            />
                                            {video.likes || 0}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}