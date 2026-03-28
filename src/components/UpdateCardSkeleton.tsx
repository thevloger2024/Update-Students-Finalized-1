import React from 'react';

export const UpdateCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-[160px] relative p-4 animate-pulse">
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-5 bg-slate-200 rounded w-1/2 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
            <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-3">
            <div className="h-3 w-20 bg-slate-200 rounded"></div>
            <div className="h-3 w-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
