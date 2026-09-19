import React, { useState } from 'react';
import { Upload, Trash2, Maximize2, X, Plus, FileImage } from 'lucide-react';
import { ResearchMedia } from '../types';
import { uploadMedia, deleteMedia } from '../lib/api';

interface MediaGalleryProps {
  sessionId: string;
  topic: string;
  mediaList: ResearchMedia[];
  onRefresh: () => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ sessionId, topic, mediaList, onRefresh }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [figureNum, setFigureNum] = useState(`Figure 1.${mediaList.length + 1}`);
  const [selectedImage, setSelectedImage] = useState<ResearchMedia | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadMedia(sessionId, file, caption, figureNum);
      setCaption('');
      setFigureNum(`Figure 1.${mediaList.length + 2}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to upload figure', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMedia(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Visual Evidence & Figures
        </span>
        <h2 className="text-xl font-bold text-white mt-1">Research Figures & Media Studio</h2>
        <p className="text-xs text-slate-400 mt-0.5">{topic}</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-900/80 border border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 transition-all text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Attach Figure or Diagram</h4>
            <p className="text-xs text-slate-400 mt-0.5">Upload architecture charts, statistical diagrams, or screenshots (PNG, JPG, SVG)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
            <input
              type="text"
              placeholder="Figure label (e.g. Figure 1.1)"
              value={figureNum}
              onChange={(e) => setFigureNum(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
            />
            <input
              type="text"
              placeholder="Caption or description..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
            />
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-lg shadow-indigo-600/20 transition active:scale-95">
            <Plus className="h-4 w-4" />
            <span>{isUploading ? 'Uploading...' : 'Select File to Upload'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Figures Attached ({mediaList.length})
          </h3>
        </div>

        {mediaList.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-10 text-center text-slate-500 text-xs">
            <FileImage className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-600" />
            No figures attached yet. Upload architecture diagrams or graphs above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mediaList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col"
              >
                <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={item.file_url}
                    alt={item.caption || item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-200">
                    <button className="p-2 rounded-lg bg-black/60 text-white hover:bg-black/80">
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600"
                      title="Delete figure"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {item.figure_num || 'Figure'}
                    </span>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 mt-0.5">
                      {item.caption || item.filename}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedImage.file_url}
                alt={selectedImage.caption}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-5 border-t border-slate-800">
              <span className="text-xs font-bold text-indigo-400">{selectedImage.figure_num}</span>
              <h4 className="text-sm font-semibold text-white mt-1">{selectedImage.caption}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
