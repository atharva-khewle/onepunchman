'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Plus, Trash, AlertTriangle, ExternalLink, Link as LinkIcon, Search, ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        creatorName: '',
        videoLink: '',
        chapterStart: 1,
        chapterEnd: 1,
        description: '',
        animationType: 'fan',
        authorQuote: '', // NEW: Author quote field
    });

    // Links State
    const [authorLinks, setAuthorLinks] = useState([
        { platform: 'Twitter', url: '', isCustom: false }
    ]);

    const SOCIAL_PRESETS = ['Twitter', 'YouTube', 'Reddit', 'Instagram', 'Patreon', 'Ko-fi'];

    // --- Input Handlers ---
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 1000) setFormData({ ...formData, description: e.target.value });
    };

    // NEW: Author quote handler
    const handleAuthorQuoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 500) setFormData({ ...formData, authorQuote: e.target.value });
    };

    const addLinkField = () => {
        setAuthorLinks([...authorLinks, { platform: 'Twitter', url: '', isCustom: false }]);
    };

    const removeLinkField = (index: number) => {
        const newLinks = [...authorLinks];
        newLinks.splice(index, 1);
        setAuthorLinks(newLinks);
    };

    const handleLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
        const newLinks = [...authorLinks];
        if (field === 'platform' && value === 'Other') {
            newLinks[index].isCustom = true;
            newLinks[index].platform = '';
        } else {
            // @ts-ignore
            newLinks[index][field] = value;
        }
        setAuthorLinks(newLinks);
    };

    const resetToDropdown = (index: number) => {
        const newLinks = [...authorLinks];
        newLinks[index].isCustom = false;
        newLinks[index].platform = 'Twitter';
        setAuthorLinks(newLinks);
    };

    // --- Submit Logic with Validation & Dup Check ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Basic Validation
            if (!formData.creatorName.trim()) {
                alert("Please enter the name of the original animator.");
                setLoading(false);
                return;
            }

            // 2. Link Validation (Must have 1)
            const cleanLinks = authorLinks
                .filter(l => l.url.trim() !== '')
                .map(l => ({ platform: l.platform || 'Website', url: l.url }));

            if (cleanLinks.length === 0) {
                alert("We need at least one social link to credit the creator!");
                setLoading(false);
                return;
            }

            // 3. Duplicate Check in Database
            const q = query(collection(db, "animations"), where("videoLink", "==", formData.videoLink.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("Wait! This animation is already in our database.");
                setLoading(false);
                return;
            }

            // 4. Submit
            await addDoc(collection(db, "animations"), {
                ...formData,
                videoLink: formData.videoLink.trim(),
                creatorName: formData.creatorName,
                chapterStart: Number(formData.chapterStart),
                chapterEnd: Number(formData.chapterEnd),
                authorLinks: cleanLinks,
                authorQuote: formData.authorQuote.trim(), // NEW: Include author quote
                timestamp: Date.now(),
                status: "pending",
                likes: 0
            });

            alert("Submission Success! The Hero Association will review it shortly.");

            // Reset
            setFormData({
                creatorName: '',
                videoLink: '',
                chapterStart: 1,
                chapterEnd: 1,
                description: '',
                animationType: 'fan',
                authorQuote: '', // NEW: Reset author quote
            });
            setAuthorLinks([{ platform: 'Twitter', url: '', isCustom: false }]);

        } catch (err) {
            console.error(err);
            alert("Connection Failed. Is your internet active?");
        }
        setLoading(false);
    };

    return (
        // THEME: White background, Text Gray-900
        <div className="min-h-screen w-full bg-white text-gray-900 px-4 py-8 md:py-12">
            <div className="max-w-3xl mx-auto">

                {/* Title Section */}
                <div className="mb-10 border-l-8 border-black pl-6 py-2">
                    <h1 className="text-4xl md:text-6xl font-black italic text-gray-900 uppercase tracking-tighter mb-2">
                        Submit <span className="text-red-600">Animation</span>
                    </h1>
                    <p className="text-lg font-bold text-gray-500">
                        Found a masterpiece? Upload it. <br />
                        <span className="text-gray-400 text-sm font-medium italic">
                            You don't need to be the creator, just ensure you provide credit links.
                        </span>
                    </p>
                </div>

                {/* Alert/Guide Panel (Manga Box Style) */}
                <div className="relative bg-yellow-50 border-4 border-black p-5 shadow-[6px_6px_0px_black] mb-10">
                    {/* Tape effect visual */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-200/80 rotate-2 shadow-sm"></div>

                    <div className="flex items-start gap-4">
                        <div className="bg-red-600 text-white p-2 border-2 border-black">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-black uppercase text-lg mb-1">Rules of Engagement</h3>
                            <ul className="list-disc list-inside text-sm font-bold text-gray-600 space-y-1">
                                <li>Link directly to <strong>YouTube, Twitter, or Reddit</strong>.</li>
                                <li>Use <strong>Official Numbering</strong> for Manga chapters.</li>
                            </ul>
                            <a href="https://cubari.moe/read/gist/OPM/" target="_blank" className="inline-flex items-center gap-1 text-red-600 font-black hover:underline mt-2 text-sm uppercase">
                                Check Chapter Index <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* --- SECTION 1: THE BASICS --- */}
                    <div className="space-y-6">
                        <h2 className="font-black text-2xl italic border-b-4 border-yellow-400 inline-block pr-10 uppercase transform -skew-x-12">
                            Target Info
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Creator Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block font-black text-xs uppercase tracking-widest mb-2 ml-1">Creator Name (Required)</label>
                                <input
                                    type="text"
                                    placeholder="Who made this?"
                                    className="w-full p-4 bg-white border-2 border-black rounded shadow-[4px_4px_0px_gray] focus:shadow-[4px_4px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none font-bold placeholder:font-medium placeholder:text-gray-400"
                                    value={formData.creatorName}
                                    onChange={e => setFormData({ ...formData, creatorName: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Video Link */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block font-black text-xs uppercase tracking-widest mb-2 ml-1">Animation URL</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="url"
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full p-4 pl-12 bg-white border-2 border-black rounded shadow-[4px_4px_0px_gray] focus:shadow-[4px_4px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none font-bold text-blue-600 placeholder:font-medium placeholder:text-gray-400"
                                        value={formData.videoLink}
                                        onChange={e => setFormData({ ...formData, videoLink: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Type Selector - UPDATED WITH CLEARER DESCRIPTIONS */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block font-black text-xs uppercase tracking-widest mb-2 ml-1">Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-4 bg-white border-2 border-black rounded shadow-[4px_4px_0px_gray] focus:shadow-[4px_4px_0px_black] transition-all outline-none appearance-none font-bold cursor-pointer hover:bg-yellow-50"
                                        value={formData.animationType}
                                        onChange={e => setFormData({ ...formData, animationType: e.target.value })}
                                    >
                                        <option value="canon">🎨 Fan Animation - Based on Manga (Official Story)</option>
                                        <option value="fan">🔥 Fan Animation - Fanon (VS Battles, What-Ifs)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">🔻</div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 font-medium space-y-1">
                                    <div>• <strong>Based on Manga:</strong> Animates actual manga chapters/scenes</div>
                                    <div>• <strong>Original/Fanon:</strong> Creative works like "Saitama vs Goku", original fights</div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* --- SECTION 2: CHAPTERS (Yellow Panel) --- */}
                    <div className="p-6 bg-yellow-400 border-2 border-black shadow-[4px_4px_0px_black] transform rotate-1 md:mx-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 mb-2">
                                <h3 className="font-black uppercase text-lg flex items-center gap-2">
                                    Timeline Placement
                                    <span className="text-[10px] font-bold bg-white px-2 py-1 border border-black rounded text-gray-500">
                                        Optional for non-canon
                                    </span>
                                </h3>
                            </div>
                            <div>
                                <label className="block font-black text-xs uppercase mb-1">Start Chapter</label>
                                <input type="number"
                                    className="w-full p-2 border-2 border-black font-black text-center text-xl outline-none focus:bg-white bg-white/80"
                                    value={formData.chapterStart} onChange={e => setFormData({ ...formData, chapterStart: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block font-black text-xs uppercase mb-1">End Chapter</label>
                                <input type="number"
                                    className="w-full p-2 border-2 border-black font-black text-center text-xl outline-none focus:bg-white bg-white/80"
                                    value={formData.chapterEnd} onChange={e => setFormData({ ...formData, chapterEnd: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>


                    {/* --- SECTION 3: CREDITS --- */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <label className="font-black text-lg italic border-b-4 border-yellow-400 uppercase transform -skew-x-12">
                                Credits Links (At least 1)
                            </label>
                            <button type="button" onClick={addLinkField} className="text-xs font-black bg-black text-white px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition flex items-center gap-1">
                                <Plus size={14} /> Add Link
                            </button>
                        </div>

                        <div className="space-y-3 pl-1">
                            {authorLinks.map((link, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-2 p-2 border-l-4 border-gray-300 hover:border-black transition-colors bg-gray-50">

                                    {/* Platform Selector */}
                                    <div className="w-full sm:w-1/3">
                                        {!link.isCustom ? (
                                            <select
                                                className="w-full h-12 bg-white px-3 border-2 border-gray-300 focus:border-black outline-none font-bold text-sm"
                                                value={link.platform}
                                                onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                                            >
                                                {SOCIAL_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                                                <option value="Other">+ Custom</option>
                                            </select>
                                        ) : (
                                            <div className="relative flex items-center">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Platform"
                                                    className="w-full h-12 bg-white pl-3 pr-8 border-2 border-yellow-500 font-bold text-sm outline-none"
                                                    value={link.platform}
                                                    onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                                                />
                                                <button type="button" onClick={() => resetToDropdown(index)} className="absolute right-2 hover:text-red-600">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* URL */}
                                    <div className="relative flex-1">
                                        <input
                                            type="url"
                                            placeholder="https://twitter.com/user"
                                            className="w-full h-12 bg-white pl-4 pr-3 border-2 border-gray-300 focus:border-black outline-none text-sm font-medium"
                                            value={link.url}
                                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                        />
                                    </div>

                                    {/* Delete */}
                                    {authorLinks.length > 1 && (
                                        <button type="button" onClick={() => removeLinkField(index)} className="self-end sm:self-auto p-3 text-gray-400 hover:text-red-600 transition">
                                            <Trash size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* --- AUTHOR QUOTE SECTION --- */}
                    <div>
                        <div className="flex justify-between mb-2 ml-1">
                            <label className="block font-black text-xs uppercase tracking-widest">
                                Creator's Quote
                                <span className="text-gray-400 font-normal ml-2">(Only fill if you are the original author)</span>
                            </label>
                            <span className={`text-xs font-black ${formData.authorQuote.length >= 500 ? 'text-red-600' : 'text-gray-400'}`}>
                                {formData.authorQuote.length}/500
                            </span>
                        </div>
                        <textarea
                            className="w-full p-4 bg-white border-2 border-yellow-400 rounded shadow-[4px_4px_0px_gray] focus:shadow-[4px_4px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] h-24 outline-none resize-none font-medium text-gray-700 leading-relaxed"
                            value={formData.authorQuote}
                            onChange={handleAuthorQuoteChange}
                            placeholder={`Only If you're the creator, share your thoughts about this work... \n(Please do not spam shit like JC Staff)`}
                        />
                    </div>


                    {/* --- DESCRIPTION --- */}
                    <div>
                        <div className="flex justify-between mb-2 ml-1">
                            <label className="block font-black text-xs uppercase tracking-widest">Comments / Description</label>
                            <span className={`text-xs font-black ${formData.description.length >= 1000 ? 'text-red-600' : 'text-gray-400'}`}>
                                {formData.description.length}/1000
                            </span>
                        </div>
                        <textarea
                            className="w-full p-4 bg-white border-2 border-black rounded shadow-[4px_4px_0px_gray] focus:shadow-[4px_4px_0px_black] focus:translate-x-[-2px] focus:translate-y-[-2px] h-32 outline-none resize-none font-medium text-gray-700 leading-relaxed"
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            placeholder="Give props to the creator..."
                        />
                    </div>


                    {/* SUBMIT BUTTON */}
                    <div className="pt-4 pb-10">
                        <button
                            disabled={loading}
                            className="w-full group relative block"
                        >
                            <div className="absolute inset-0 bg-black rounded translate-x-2 translate-y-2"></div>
                            <div className={`relative border-2 border-black py-5 text-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1 ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-500'
                                }`}>
                                {loading ? 'Scanning Database...' : (
                                    <>
                                        Punch It <div className="bg-white text-red-600 text-[10px] p-1 leading-none rounded border border-black rotate-3">SEND</div>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}