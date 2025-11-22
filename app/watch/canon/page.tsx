'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { VideoData } from '@/lib/types';
import VideoPlayer from '@/app/components/VideoPlayer';
import { User, AlertOctagon, ExternalLink, BookOpen, Upload } from 'lucide-react';
import Link from 'next/link';

// --- CONFIG ---
const LATEST_MANGA_CHAPTER = 210;

type TimelineItem =
    | { type: 'video'; data: VideoData }
    | { type: 'gap'; start: number; end: number };

// --- COMPONENT: Desktop/Sidebar Link ---
const ChapterLinkSidebar = ({ chapter }: { chapter: number }) => (
    <a
        href={`https://cubari.moe/read/gist/OPM/${chapter}/1/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full bg-white border-2 border-black px-3 py-2 mb-2 shadow-[3px_3px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_black] transition-all group"
    >
        <span className="font-black text-[10px] uppercase text-black group-hover:text-red-600 transition-colors">
            Read Chapter {chapter}
        </span>
        <ExternalLink size={12} className="text-gray-400 group-hover:text-black" />
    </a>
);

// --- COMPONENT: Mobile Top Link (Horizontal) ---
const ChapterLinkMobile = ({ chapter }: { chapter: number }) => (
    <a
        href={`https://cubari.moe/read/gist/OPM/${chapter}/1/`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-yellow-400 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_black] active:shadow-[0px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
    >
        <span className="font-black text-[10px] uppercase text-black">Read Ch {chapter}</span>
        <ExternalLink size={10} className="text-black" />
    </a>
);

export default function CanonPage() {
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndProcessVideos = async () => {
            // Fetch Canon Videos
            const q = query(collection(db, "animations"), where("status", "==", "approved_canon"));
            const querySnapshot = await getDocs(q);
            const videos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoData));

            // Sort by Chapter
            videos.sort((a, b) => {
                if (a.chapterStart !== b.chapterStart) return a.chapterStart - b.chapterStart;
                return a.chapterEnd - b.chapterEnd;
            });

            const processed: TimelineItem[] = [];
            let maxChapterCovered = 0;

            videos.forEach(video => {
                if (video.chapterStart > maxChapterCovered + 1 && maxChapterCovered > 0) {
                    processed.push({ type: 'gap', start: maxChapterCovered + 1, end: video.chapterStart - 1 });
                } else if (maxChapterCovered === 0 && video.chapterStart > 1) {
                    processed.push({ type: 'gap', start: 1, end: video.chapterStart - 1 });
                }
                processed.push({ type: 'video', data: video });
                maxChapterCovered = Math.max(maxChapterCovered, video.chapterEnd);
            });

            if (maxChapterCovered < LATEST_MANGA_CHAPTER) {
                processed.push({ type: 'gap', start: maxChapterCovered + 1, end: LATEST_MANGA_CHAPTER });
            }

            setTimelineItems(processed);
            setLoading(false);
        };

        fetchAndProcessVideos();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 font-sans relative overflow-x-hidden">

            {/* Custom CSS for Float Animation */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>

            {/* ===================================================
                BACKGROUND LAYERS
            =================================================== */}

            {/* 1. RIGHT BAR BACKGROUND (Visible on all screens) */}
            <div
                className="absolute right-0 top-0 bottom-0 w-[15%] md:w-[20%] z-0 border-l-4 border-black"
                style={{
                    backgroundImage: `url('/grass_v2.png')`,
                    backgroundSize: '100% auto',
                    backgroundRepeat: 'repeat-y',
                    backgroundBlendMode: ''
                }}
            >
            </div>

            {/* 2. FIXED GAROU (Animated Floating) */}
            <div className="fixed top-[25%] md:top-1/3 right-0 md:right-[1%] w-[15%] md:w-[18%] max-w-[200px] z-30 pointer-events-none">
                <div className="relative animate-float">
                    <div className="absolute -top-14 -left-6 md:-left-4 bg-white border-4 border-black p-1 md:p-2 rounded-xl rounded-br-none shadow-[2px_2px_0px_black] md:shadow-[4px_4px_0px_black] z-10">
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-black leading-none text-center">
                            Where are <br />the <span className="text-red-600">Heroes?</span>
                        </p>
                    </div>
                    <img
                        src="/garou-run.png"
                        alt="Garou"
                        className="w-full object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </div>
            </div>


            {/* ===================================================
                MAIN CONTENT GRID 
                Mobile: [85% | 15%] 
                Desktop: [20% | 60% | 20%]
            =================================================== */}
            <div className="grid grid-cols-[85%_15%] md:grid-cols-[20%_60%_20%] relative z-10">

                {/* LOADING */}
                {loading && (
                    <div className="col-span-1 md:col-span-2 min-h-screen flex items-center justify-center bg-white border-r-4 border-black">
                        <div className="text-2xl font-black uppercase animate-pulse text-gray-400 italic">
                            Accessing Archives...
                        </div>
                    </div>
                )}

                {timelineItems.map((item, idx) => (
                    <div key={idx} className="contents">

                        {/* ---------------------------- */}
                        {/* COL 1: SIDEBAR (Desktop Only) */}
                        {/* ---------------------------- */}
                        <div className="hidden md:flex flex-col items-end p-4 border-r-4 border-black bg-yellow-400 min-h-full relative">
                            <div className="sticky top-24 w-full pl-4">
                                {item.type === 'video' ? (
                                    <div className="text-right relative">
                                        <div className="absolute -right-[24px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-black rounded-full z-20 shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"></div>

                                        <div className="font-black text-[10px] uppercase mb-3 text-black border-b-2 border-black pb-1 inline-block">
                                            Source Chapters
                                        </div>
                                        {item.data.chapterEnd - item.data.chapterStart < 4 ? (
                                            Array.from({ length: item.data.chapterEnd - item.data.chapterStart + 1 }, (_, i) => item.data.chapterStart + i).map(ch =>
                                                <ChapterLinkSidebar key={ch} chapter={ch} />
                                            )
                                        ) : (
                                            <div className="space-y-1 w-full">
                                                <ChapterLinkSidebar chapter={item.data.chapterStart} />
                                                <div className="text-center font-black text-lg leading-none">. . .</div>
                                                <ChapterLinkSidebar chapter={item.data.chapterEnd} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-32 border-r-4 border-dotted border-black/20 mr-[-4px]"></div>
                                )}
                            </div>
                        </div>


                        {/* ---------------------------- */}
                        {/* COL 2: CONTENT FEED          */}
                        {/* ---------------------------- */}
                        <div className="bg-gray-100 py-8 pl-3 pr-3 md:px-12 border-b-4 md:border-b-0 md:border-r-4 border-black relative flex flex-col">

                            {/* UPDATED: Continuous Dotted Line for the timeline effect */}
                            {/* This sits absolutely inside this grid cell, spanning top to bottom behind the cards */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-r-4 border-dotted border-gray-300 transform -translate-x-1/2 z-0 hidden md:block"></div>
                            {/* Thinner version for mobile so it doesn't look too heavy */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-r-4 border-dotted border-gray-300/50 transform -translate-x-1/2 z-0 md:hidden"></div>

                            {item.type === 'gap' ? (
                                // --- MISSING DATA CARD ---
                                <div className="relative z-10 w-full border-4 border-dashed border-gray-300 bg-white p-6 md:p-8 text-center rounded-xl group hover:border-red-400 hover:bg-red-50 transition-all mb-12">
                                    <AlertOctagon size={32} className="text-gray-300 mx-auto mb-2 group-hover:text-red-500 transition-colors" />
                                    <h3 className="font-black text-lg uppercase text-gray-400 group-hover:text-red-600 transition-colors">Missing Data</h3>

                                    {/* UPDATED: CLEANER TEXT HANDLING FOR MOBILE */}
                                    <div className="my-6 transform-none md:transform md:rotate-[-2deg] w-full flex justify-center">
                                        <span className="bg-yellow-400 text-black font-black text-lg md:text-2xl px-4 py-3 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.1)] text-center leading-tight block max-w-full break-words">
                                            MISSING CHAPTERS <br className="md:hidden" />
                                            <span className="whitespace-nowrap">{item.start} - {item.end}</span>
                                        </span>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                        <a
                                            href={`https://cubari.moe/read/gist/OPM/${item.start}/1/`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 bg-white text-black border-2 border-black px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-gray-100 hover:translate-x-[1px] hover:translate-y-[1px] shadow-[4px_4px_0px_gray] transition-all"
                                        >
                                            <BookOpen size={14} /> Read Ch. {item.start}
                                        </a>
                                        <Link href="/upload" className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_gray] hover:shadow-[4px_4px_0px_black]">
                                            <Upload size={14} /> Upload Animation
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                // --- VIDEO SECTION ---
                                <div className="relative z-10 w-full mb-16 md:mb-12">

                                    {/* MOBILE CHAPTER LINKS ROW */}
                                    <div className="md:hidden mb-4 flex flex-wrap justify-end gap-2">
                                        {item.data.chapterEnd - item.data.chapterStart < 4 ? (
                                            Array.from({ length: item.data.chapterEnd - item.data.chapterStart + 1 }, (_, i) => item.data.chapterStart + i).map(ch =>
                                                <ChapterLinkMobile key={ch} chapter={ch} />
                                            )
                                        ) : (
                                            <>
                                                <ChapterLinkMobile chapter={item.data.chapterStart} />
                                                <span className="font-black">..</span>
                                                <ChapterLinkMobile chapter={item.data.chapterEnd} />
                                            </>
                                        )}
                                    </div>

                                    {/* Desktop Chapter Tab */}
                                    <div className="absolute -top-3 left-0 z-20 hidden md:block">
                                        <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_white]">
                                            {item.data.chapterStart === item.data.chapterEnd ? `Ch ${item.data.chapterStart}` : `Ch ${item.data.chapterStart}-${item.data.chapterEnd}`}
                                        </span>
                                    </div>

                                    {/* MAIN VIDEO CARD */}
                                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#dc2626] group hover:-translate-y-1 hover:shadow-[10px_10px_0px_#b91c1c] transition-all duration-200">

                                        <div className="bg-black border-b-4 border-black">
                                            <VideoPlayer url={item.data.videoLink} />
                                        </div>

                                        <div className="p-4 md:p-5">
                                            {item.data.authorQuote && item.data.authorQuote.trim() !== '' && (
                                                <div className="mb-4 relative pl-4">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
                                                    <p className="font-bold text-gray-800 text-sm italic leading-relaxed">
                                                        "{item.data.authorQuote}"
                                                    </p>
                                                </div>
                                            )}

                                            <div className={`flex flex-col md:flex-row items-start md:items-center justify-between pt-4 ${item.data.authorQuote ? 'border-t-2 border-gray-100' : ''} mt-2 gap-y-3`}>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-black text-white p-1">
                                                        <User size={12} />
                                                    </div>
                                                    <span className="font-black text-xs uppercase tracking-wide text-gray-900">
                                                        {item.data.creatorName}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 flex-wrap justify-start md:justify-end w-full md:w-auto">
                                                    {item.data.authorLinks.map((link, i) => (
                                                        <a
                                                            key={i}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:underline hover:text-blue-800 flex items-center gap-1 transition-colors"
                                                        >
                                                            {link.platform}
                                                            <ExternalLink size={10} className="mb-[1px]" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ---------------------------- */}
                        {/* COL 3: RIGHT SPACER (15-20%) */}
                        {/* ---------------------------- */}
                        <div className="min-h-full"></div>

                    </div>
                ))}
            </div>
        </div>
    );
}