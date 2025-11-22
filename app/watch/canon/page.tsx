'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { VideoData } from '@/lib/types';
import VideoPlayer from '@/app/components/VideoPlayer';
import { User, AlertOctagon, ExternalLink, BookOpen, Upload } from 'lucide-react';
import Link from 'next/link';

// --- CONFIG ---
// Update this as manga releases new chapters
const LATEST_MANGA_CHAPTER = 210;

type TimelineItem =
    | { type: 'video'; data: VideoData }
    | { type: 'gap'; start: number; end: number };

// --- COMPONENT: Left Column Link ---
const ChapterLink = ({ chapter }: { chapter: number }) => (
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
                // Detect Gaps
                if (video.chapterStart > maxChapterCovered + 1 && maxChapterCovered > 0) {
                    processed.push({ type: 'gap', start: maxChapterCovered + 1, end: video.chapterStart - 1 });
                } else if (maxChapterCovered === 0 && video.chapterStart > 1) {
                    processed.push({ type: 'gap', start: 1, end: video.chapterStart - 1 });
                }

                processed.push({ type: 'video', data: video });
                maxChapterCovered = Math.max(maxChapterCovered, video.chapterEnd);
            });

            // Final Gap to Latest Chapter
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

            {/* ===================================================
                BACKGROUND LAYERS
            =================================================== */}
            <div className="absolute right-0 top-0 bottom-0 w-[20%] z-0 hidden md:block border-l-4 border-black bg-[#567d46]"
                style={{
                    backgroundImage: `url('/grass.png')`,
                    backgroundBlendMode: 'multiply'
                }}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
            </div>

            {/* GAROU FIXED IMG */}
            <div className="fixed top-1/3 right-[1%] w-[18%] max-w-[200px] z-30 pointer-events-none hidden md:block">
                <div className="relative">
                    <div className="absolute -top-14 -left-4 bg-white border-4 border-black p-2 rounded-xl rounded-br-none shadow-[4px_4px_0px_black] animate-bounce">
                        <p className="text-[10px] font-black uppercase text-black leading-none text-center">
                            Where are the <br /><span className="text-red-600">Heroes?</span>
                        </p>
                    </div>
                    <img
                        src="/garou-run.png"
                        alt="Garou"
                        className="w-full object-contain drop-shadow-[8px_8px_0px_rgba(0,0,0,0.5)]"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </div>
            </div>


            {/* ===================================================
                MAIN CONTENT GRID
            =================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-[20%_60%_20%] relative z-10">

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
                        {/* COL 1: LEFT LINKS            */}
                        {/* ---------------------------- */}
                        <div className="hidden md:flex flex-col items-end p-4 border-r-4 border-black bg-yellow-400 min-h-full relative">
                            <div className="sticky top-24 w-full pl-4">
                                {item.type === 'video' ? (
                                    <div className="text-right relative">
                                        {/* Dot */}
                                        <div className="absolute -right-[24px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-black rounded-full z-20 shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"></div>

                                        <div className="font-black text-[10px] uppercase mb-3 text-black border-b-2 border-black pb-1 inline-block">
                                            Source Chapters
                                        </div>
                                        {/* Read Chapter x */}
                                        {item.data.chapterEnd - item.data.chapterStart < 4 ? (
                                            Array.from({ length: item.data.chapterEnd - item.data.chapterStart + 1 }, (_, i) => item.data.chapterStart + i).map(ch =>
                                                <ChapterLink key={ch} chapter={ch} />
                                            )
                                        ) : (
                                            <div className="space-y-1 w-full">
                                                <ChapterLink chapter={item.data.chapterStart} />
                                                <div className="text-center font-black text-lg leading-none">. . .</div>
                                                <ChapterLink chapter={item.data.chapterEnd} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-32 border-r-4 border-dotted border-black/20 mr-[-4px]"></div>
                                )}
                            </div>
                        </div>


                        {/* ---------------------------- */}
                        {/* COL 2: CENTER CONTENT        */}
                        {/* ---------------------------- */}
                        <div className="bg-gray-100 py-8 px-4 md:px-12 border-b-4 md:border-b-0 md:border-r-4 border-black">

                            {/* MOBILE HEADER */}
                            <div className="md:hidden mb-2 flex justify-end">
                                {item.type === 'video' && (
                                    <a href={`https://cubari.moe/read/gist/OPM/${item.data.chapterStart}/1/`} target="_blank" className="text-[10px] font-black uppercase underline">
                                        Read Source Ch {item.data.chapterStart}
                                    </a>
                                )}
                            </div>

                            {item.type === 'gap' ? (
                                // --- GAP CARD ---
                                <div className="border-4 border-dashed border-gray-300 bg-white p-6 md:p-8 text-center rounded-xl group hover:border-red-400 hover:bg-red-50 transition-all">
                                    <AlertOctagon size={32} className="text-gray-300 mx-auto mb-2 group-hover:text-red-500 transition-colors" />
                                    <h3 className="font-black text-lg uppercase text-gray-400 group-hover:text-red-600 transition-colors">Missing Data</h3>
                                    <p className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-6">
                                        Chapters {item.start} - {item.end}
                                    </p>

                                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                        <a
                                            href={`https://cubari.moe/read/gist/OPM/${item.start}/1/`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 bg-white text-black border-2 border-black px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-gray-100 hover:translate-x-[1px] hover:translate-y-[1px] shadow-[4px_4px_0px_gray] transition-all"
                                        >
                                            <BookOpen size={14} /> Read Missing
                                        </a>
                                        <Link href="/upload" className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_gray] hover:shadow-[4px_4px_0px_black]">
                                            <Upload size={14} /> Upload Animation
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                // --- VIDEO CARD ---
                                <div className="relative mb-12">

                                    <div className="absolute -top-3 left-0 z-20">
                                        <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_white]">
                                            {item.data.chapterStart === item.data.chapterEnd ? `Ch ${item.data.chapterStart}` : `Ch ${item.data.chapterStart}-${item.data.chapterEnd}`}
                                        </span>
                                    </div>

                                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#dc2626] group hover:-translate-y-1 hover:shadow-[10px_10px_0px_#b91c1c] transition-all duration-200">

                                        {/* Video */}
                                        <div className="bg-black border-b-4 border-black">
                                            <VideoPlayer url={item.data.videoLink} />
                                        </div>

                                        <div className="p-5">

                                            {/* Author Note - Hide if empty */}
                                            {item.data.description && item.data.description.trim() !== '' && (
                                                <div className="mb-4 relative pl-4">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
                                                    <p className="font-bold text-gray-800 text-sm italic leading-relaxed">
                                                        "{item.data.description}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className={`flex flex-wrap items-center justify-between pt-4 ${item.data.description ? 'border-t-2 border-gray-100' : ''} mt-2 gap-y-2`}>

                                                <div className="flex items-center gap-2">
                                                    <div className="bg-black text-white p-1">
                                                        <User size={12} />
                                                    </div>
                                                    <span className="font-black text-xs uppercase tracking-wide text-gray-900">
                                                        {item.data.creatorName}
                                                    </span>
                                                </div>

                                                {/* SOCIAL LINKS - BLUE TEXT NAMES */}
                                                <div className="flex items-center gap-4 flex-wrap justify-end">
                                                    {item.data.authorLinks.map((link, i) => (
                                                        <a
                                                            key={i}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title={`Visit ${link.platform}`}
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
                        {/* COL 3: RIGHT SPACER          */}
                        {/* ---------------------------- */}
                        <div className="hidden md:block min-h-full"></div>

                    </div>
                ))}
            </div>
        </div>
    );
}