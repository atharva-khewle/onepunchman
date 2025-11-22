'use client';
import React from 'react';
import { ExternalLink, PlayCircle } from 'lucide-react';

interface PlayerProps {
    url: string;
}

export default function VideoPlayer({ url }: PlayerProps) {

    // 1. Helper function to extract YouTube ID (Robust Regex)
    const getYouTubeID = (link: string) => {
        if (!link) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = link.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytID = getYouTubeID(url);

    // CASE A: It is YouTube -> Render standard Iframe (Auto-aspect ratio via CSS)
    if (ytID) {
        return (
            <div className="relative w-full pt-[56.25%] bg-black group overflow-hidden">
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${ytID}?rel=0&modestbranding=1`}
                    title="Video content"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    // CASE B: It is NOT YouTube (Twitter, Reddit, etc) -> Render a clickable Card
    return (
        <div className="relative w-full pt-[56.25%] bg-zinc-900 group border border-zinc-800 hover:border-zinc-600 transition-colors">

            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center decoration-0"
            >
                {/* Icon */}
                <PlayCircle size={48} className="text-zinc-600 group-hover:text-yellow-500 transition-colors duration-300" />

                {/* Text */}
                <div>
                    <p className="text-white font-bold text-sm uppercase tracking-wider">External Video</p>
                    <p className="text-zinc-500 text-xs mt-1 flex items-center justify-center gap-1">
                        Source <ExternalLink size={10} />
                    </p>
                </div>
            </a>
        </div>
    );
}