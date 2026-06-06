import React from 'react';

const FolderCard = ({ folder, onClick }) => {
  return (
    <div 
      className="bg-black border border-[#00FF00]/30 p-4 flex items-center gap-4 hover:border-[#00FF00] hover:bg-[#00FF00]/5 cursor-pointer transition-all group font-mono"
      onClick={onClick}
    >
      <div className="w-10 h-10 border border-[#00FF00]/50 flex items-center justify-center text-[#00FF00] group-hover:bg-[#00FF00] group-hover:text-black transition-all">
        <span className="text-xl">{'#'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-bold text-[#00FF00] truncate uppercase tracking-tighter">
          {folder.Title || folder.title}
        </h3>
        <p className="text-[9px] text-[#00FF00]/40">SUBDIRECTORY_NODE</p>
      </div>
      <div className="text-[#00FF00]/30 group-hover:text-[#00FF00] font-bold text-xs">
        {">>"}
      </div>
    </div>
  );
};

export default FolderCard;
