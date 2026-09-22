import React, { useState } from 'react';
import {
  Folder,
  Globe,
  Layers,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Download,
  Search,
  ExternalLink,
  Eye,
  Check,
} from 'lucide-react';

interface LibraryViewProps {
  items: any[];
  onDeleteItem: (id: string) => void;
  onOpenItem?: (item: any) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  items,
  onDeleteItem,
  onOpenItem,
}) => {
  const [filter, setFilter] = useState<'all' | 'website' | 'app' | 'image' | 'video' | 'document'>('all');
  const [search, setSearch] = useState('');

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === 'all' || item.type === filter || (item.imageUrl && filter === 'image') || (item.videoUrl && filter === 'video') || (item.files && filter === 'website');
    const title = item.title || item.prompt || 'Untitled Item';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#0a0d14] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading">Project & Asset Library</h2>
            <p className="text-xs text-slate-400">All generated websites, apps, media files, and analytical reports</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto">
          {['all', 'website', 'app', 'image', 'video', 'document'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 px-6 border-b border-slate-800/80 bg-[#080b10]">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects and assets by title or prompt..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-center text-slate-500">
              <Folder className="w-12 h-12 text-slate-700 mb-3 stroke-1" />
              <p className="text-sm font-medium text-slate-400">Library is clean</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Generated websites, apps, images, and documents will automatically be organized here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isImage = !!item.imageUrl;
                const isVideo = !!item.videoUrl;
                const isWebsite = !!item.files?.html;
                const isApp = item.type === 'app';

                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                  >
                    {isImage ? (
                      <div className="aspect-video bg-black overflow-hidden relative">
                        <img
                          src={item.imageUrl}
                          alt={item.prompt}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : isVideo ? (
                      <div className="aspect-video bg-black flex items-center justify-center">
                        <video src={item.videoUrl} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border-b border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                          {isWebsite ? <Globe className="w-5 h-5" /> : isApp ? <Layers className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-white truncate font-heading">{item.title || item.prompt}</h4>
                          <span className="text-[10px] text-cyan-300 font-mono uppercase">
                            {isWebsite ? 'Website Project' : isApp ? 'Interactive Web App' : 'Document Analysis'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-4 flex items-center justify-between bg-[#090c12] border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Delete from Library"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
