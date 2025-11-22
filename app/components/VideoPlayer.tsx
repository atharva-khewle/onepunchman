'use client';
import React from 'react';
import { ExternalLink, PlayCircle, AlertCircle } from 'lucide-react';

interface PlayerProps {
    url: string;
}

export default function VideoPlayer({ url }: PlayerProps) {

    // 1. Helper to extract YouTube ID
    const getYouTubeID = (link: string) => {
        if (!link) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = link.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // 2. Helper to identify sites that BLOCK iframes (Socials usually block embeds)
    const isEmbedBlocked = (link: string) => {
        if (!link) return false;
        const blockedDomains = [
            'twitter.com',
            'x.com',
            'reddit.com',
            'instagram.com',
            'facebook.com',
            'tiktok.com',
            'linkedin.com',
            't.co'
        ];
        return blockedDomains.some(domain => link.toLowerCase().includes(domain));
    };

    const ytID = getYouTubeID(url);
    const blocked = isEmbedBlocked(url);

    // CASE A: YouTube (Always works in Embed)
    if (ytID) {
        return (
            <div className="relative w-full pt-[56.25%] bg-black group overflow-hidden">
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${ytID}?rel=0&modestbranding=1`}
                    title="YouTube content"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    // CASE B: Sites known to BLOCK Embeds (Use "Mask" Card from before)
    if (blocked) {
        return (
            <div className="relative w-full pt-[56.25%] bg-zinc-900 group border border-zinc-800 hover:border-zinc-600 transition-colors">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center decoration-0"
                >
                    <PlayCircle size={48} className="text-zinc-600 group-hover:text-yellow-500 transition-colors duration-300" />

                    <div>
                        <p className="text-white font-bold text-sm uppercase tracking-wider">External Media</p>
                        <p className="text-zinc-500 text-xs mt-1 flex items-center justify-center gap-1">
                            View on {new URL(url).hostname.replace('www.', '')} <ExternalLink size={10} />
                        </p>
                    </div>
                </a>
            </div>
        );
    }

    // CASE C: Unknown / Open Web Sites (Use WebView + Fallback Button)
    return (
        <div className="relative w-full pt-[56.25%] bg-gray-100 border border-zinc-200 overflow-hidden group">

            {/* Background Hint in case iframe is transparent or slow */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <p className="text-gray-400 text-xs font-bold uppercase animate-pulse">Loading Preview...</p>
            </div>

            {/* The WebView */}
            <iframe
                src={url}
                className="absolute top-0 left-0 w-full h-full bg-white z-10"
                title="External content"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                loading="lazy"
                allowFullScreen
            />

            {/* Floating "Open Website" Button (Bottom Right) */}
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 z-20 flex items-center gap-2 bg-black hover:bg-red-600 text-white px-3 py-2 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(255,255,255,0.5)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all border-2 border-white"
            >
                <span>Go To Site</span>
                <ExternalLink size={10} />
            </a>
        </div>
    );
}