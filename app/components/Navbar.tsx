import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function Navbar() {
    return (
        // MANGA STYLE: White background with thick black bottom border
        <nav className="bg-white border-b-4 border-black sticky top-0 z-50 h-16 md:h-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex justify-between items-center">

                {/* LOGO AREA */}
                <Link href="/" className="group flex items-center gap-1 transform hover:-skew-x-6 transition-transform duration-200">
                    {/* "ONE" in a yellow box */}
                    <div className="bg-yellow-400 text-black font-black italic text-2xl md:text-3xl px-2 border-2 border-black shadow-[3px_3px_0px_black]">
                        ONE
                    </div>
                    {/* "PUNCH" in red text with shadow */}
                    <div className="text-red-600 font-black italic text-2xl md:text-3xl tracking-tighter drop-shadow-[1px_1px_0px_black] pl-1">
                        FANS
                    </div>
                </Link>

                {/* DESKTOP NAVIGATION */}
                <div className="hidden md:flex items-center gap-8">
                    {/* Links */}
                    <Link href="/watch/canon" className="font-black uppercase tracking-widest text-sm text-gray-900 hover:text-red-600 transition-colors relative group">
                        Watch Saga
                        <span className="absolute -bottom-1 left-0 w-0 h-1 bg-red-600 transition-all group-hover:w-full"></span>
                    </Link>

                    <Link href="/watch/fan" className="font-black uppercase tracking-widest text-sm text-gray-900 hover:text-yellow-500 transition-colors relative group">
                        FanVerse
                        <span className="absolute -bottom-1 left-0 w-0 h-1 bg-yellow-400 transition-all group-hover:w-full"></span>
                    </Link>

                    {/* Upload CTA */}
                    <Link href="/upload" className="flex items-center gap-2 bg-black text-white px-5 py-2 font-bold uppercase text-xs tracking-wider border-2 border-black hover:bg-red-600 hover:border-black hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all transform hover:-translate-y-0.5">
                        <ShieldAlert size={16} />
                        Upload
                    </Link>
                </div>

                {/* MOBILE MENU ICON (Simple upload link for phone) */}
                <Link href="/upload" className="md:hidden bg-red-600 text-white p-2 border-2 border-black shadow-[2px_2px_0px_black] active:shadow-none active:translate-y-[2px]">
                    <ShieldAlert size={20} />
                </Link>

            </div>
        </nav>
    );
}