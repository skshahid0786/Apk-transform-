import React from 'react';
import { Loader } from './Loader';
import { ImageIcon } from './icons/ImageIcon';

interface ImagePanelProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  loadingMessage?: string;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ title, imageUrl, isLoading = false, loadingMessage }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-2 flex flex-col items-center justify-center text-slate-500 text-sm overflow-hidden h-full transition-all duration-300">
      <div className="w-full h-full relative flex items-center justify-center rounded-lg bg-slate-900/50">
        {isLoading ? (
          <Loader message={loadingMessage} />
        ) : imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-contain rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <ImageIcon />
            <span className="text-slate-500">{title}</span>
          </div>
        )}
      </div>
    </div>
  );
};