import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-20">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
        <div className="w-12 h-12 bg-emerald-500 rounded-xl animate-pulse" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
      <p className="text-slate-500 text-center max-w-md mb-8">
        We're currently working hard to bring you the best {(title || '').toLowerCase()} experience. 
        Stay tuned for updates on Nasirah Mart!
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Shopping
      </button>
    </div>
  );
};
