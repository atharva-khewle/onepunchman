import Link from 'next/link';
import Image from 'next/image';
import { Play, Zap, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white text-gray-900 relative overflow-x-hidden font-sans flex items-center">

      {/* ⚡ BACKGROUND DECORATION (Yellow Slash) */}
      <div className="absolute top-0 left-0 w-full md:w-[55%] h-full bg-yellow-400 transform -skew-x-12 -translate-x-[20%] border-r-4 border-black z-0 opacity-20 md:opacity-100 hidden md:block"></div>

      {/* ⚡ MAIN CONTENT LAYOUT */}
      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 py-4 md:px-12 md:py-8 flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-16">

        {/* -------------------------------------------- */}
        {/* SECTION 1: MUMEN RIDER (LEFT SIDE / FIRST SIGHT) */}
        {/* -------------------------------------------- */}
        <div className="w-full md:w-5/12 flex justify-center md:justify-end order-1">

          {/* IMAGE CARD - Scaled up for Laptop (lg:max-w-[600px]) */}
          <div className="relative w-full max-w-[500px] lg:max-w-[650px] bg-white border-4 border-black shadow-[8px_8px_0px_rgba(220,38,38,1)] flex flex-col transform lg:rotate-1 transition-transform hover:rotate-0 duration-300">

            {/* The Image */}
            <div className="relative aspect-[1360/1230] w-full border-b-4 border-black bg-gray-50 overflow-hidden p-3">
              {/* Overlay to unify image tone */}
              <div className="absolute inset-0 bg-black/5 pointer-events-none z-10 mix-blend-multiply"></div>
              <Image
                src="/mumen-rider-v2.png"
                alt="Mumen Rider - Justice Crash"
                width={1360}
                height={1230}
                priority
                className="object-cover w-full h-full scale-105"
              />
            </div>

            {/* The Quote */}
            <div className="p-4 md:p-6 lg:p-8 text-center bg-white relative z-20">
              <p className="font-black italic uppercase text-sm md:text-lg lg:text-xl leading-tight mb-2 lg:mb-3">
                "He didn’t give up, even when he knew he’d lose."
              </p>
              <div className="h-1 w-16 lg:w-24 bg-red-600 mx-auto mb-2 lg:mb-3"></div>
              <p className="text-xs md:text-sm lg:text-base font-bold text-gray-600 uppercase tracking-widest">
                So why should we?<br />
                <span className="text-red-600">Stand Up. Create. Fight.</span>
              </p>
            </div>

          </div>
        </div>


        {/* -------------------------------------------- */}
        {/* SECTION 2: TEXT & ACTIONS (RIGHT SIDE) */}
        {/* -------------------------------------------- */}
        <div className="w-full md:w-7/12 flex flex-col text-center md:text-left order-2 md:pl-10 lg:pl-20">

          {/* 1. Small Badge - Scaled for LG */}
          <div className="self-center md:self-start inline-block bg-black text-white px-3 py-1 lg:px-4 lg:py-2 font-bold italic uppercase text-[10px] md:text-xs lg:text-sm tracking-widest mb-4 transform -skew-x-12 border border-yellow-400 shadow-sm">
            By the fans, Of the fans, For the fans
          </div>

          {/* 2. Title - Scaled to 9XL on LG */}
          <h1 className="text-5xl md:text-7xl lg:text-[7.5rem] xl:text-9xl font-black italic leading-[0.85] tracking-tighter uppercase mb-6 lg:mb-10">
            One Punch <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-red-800 drop-shadow-[3px_3px_0px_black] pr-7 pb-2 block md:inline">
              Fans
            </span>
          </h1>

          {/* 3. Manifesto Text - Bolder and larger on LG */}
          <div className="mb-8 lg:mb-12 md:pr-20">
            <p className="text-lg lg:text-2xl font-bold text-gray-900 border-l-4 lg:border-l-8 border-yellow-400 pl-4 lg:pl-6 mb-3 lg:mb-4 leading-tight">
              We waited years. Expected Peak.<br />
              All we got was DISAPPOINTMENT.
            </p>
            <p className="text-gray-600 text-sm lg:text-lg leading-relaxed font-medium">
              If they won’t honor the legacy, we will.<br />
              Collecting the strongest fan-made episodes to build the OPM we deserved.
            </p>
          </div>


          {/* ------------------------------- */}
          {/* BUTTONS CONTAINER - Scaled Inputs */}
          {/* ------------------------------- */}

          <div className="w-full md:max-w-lg lg:max-w-xl">

            {/* ROW 1: VIEW MODES */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-4 lg:mb-6">
              {/* Watch Saga */}
              <Link href="/watch/canon" className="group relative w-full h-full">
                <div className="absolute inset-0 bg-black rounded translate-x-1 translate-y-1 lg:translate-x-2 lg:translate-y-2 transition-transform"></div>
                <button className="relative w-full h-full bg-red-600 text-white border-2 border-black py-3 md:py-4 lg:py-6 px-2 rounded flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 hover:-translate-y-1 hover:-translate-x-1 lg:hover:-translate-y-2 lg:hover:-translate-x-2 transition-transform">
                  <Play className="fill-white w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                  <span className="font-black italic uppercase text-xs md:text-lg lg:text-2xl tracking-tight">
                    Watch Saga
                  </span>
                </button>
              </Link>

              {/* Fanverse */}
              <Link href="/watch/fan" className="group relative w-full h-full">
                <div className="absolute inset-0 bg-black rounded translate-x-1 translate-y-1 lg:translate-x-2 lg:translate-y-2 transition-transform"></div>
                <button className="relative w-full h-full bg-yellow-400 text-black border-2 border-black py-3 md:py-4 lg:py-6 px-2 rounded flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 hover:-translate-y-1 hover:-translate-x-1 lg:hover:-translate-y-2 lg:hover:-translate-x-2 transition-transform">
                  <Zap className="fill-black w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                  <span className="font-black italic uppercase text-xs md:text-lg lg:text-2xl tracking-tight">
                    FanVerse
                  </span>
                </button>
              </Link>
            </div>

            {/* ROW 2: UPLOAD */}
            <Link href="/upload" className="block group relative">
              <div className="absolute inset-0 bg-gray-200 rounded translate-x-1 translate-y-1 lg:translate-x-2 lg:translate-y-2"></div>
              <div className="relative bg-white border-2 border-black py-3 md:py-4 lg:py-5 px-4 lg:px-6 rounded flex justify-between items-center hover:-translate-y-1 hover:-translate-x-1 lg:hover:-translate-y-2 lg:hover:-translate-x-2 transition-transform cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3 lg:gap-5">
                  <div className="bg-black p-1.5 lg:p-2 rounded-full text-white">
                    <ShieldAlert size={16} className="lg:w-6 lg:h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black uppercase text-xs md:text-sm lg:text-lg leading-none mb-1 text-gray-900">
                      Help Hero Association
                    </p>
                    <p className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-wide hidden md:block">
                      Upload missing archives
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-red-600 transition-colors w-5 h-5 lg:w-7 lg:h-7" />
              </div>
            </Link>

          </div>
          {/* END BUTTONS */}

        </div>

      </div>
    </div>
  );
}