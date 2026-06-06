import React from 'react';

const PdfCard = ({ pdf, onClick }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString();
    } catch (e) { return null; }
  };

  const dateTimeStr = formatDateTime(pdf.created_at || pdf.start_time);

  return (
    <div 
      className="bg-black border border-[#00FF00]/20 p-4 hover:border-[#00FF00] hover:bg-[#00FF00]/5 transition-all cursor-pointer font-mono group"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 border border-red-500/50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-black">
          <span className="text-xs font-bold">PDF</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-[#00FF00] mb-1 uppercase truncate">
            {pdf.Title || pdf.title || pdf.name}
          </h3>
          {dateTimeStr && (
            <p className="text-[9px] text-[#00FF00]/40 uppercase">
              MODIFIED: {dateTimeStr}
            </p>
          )}
        </div>

        <div className="text-[#00FF00]/30 group-hover:text-[#00FF00]">{">>"}</div>
      </div>
    </div>
  );
};

export default PdfCard;
