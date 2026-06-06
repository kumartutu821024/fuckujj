import React from 'react';

const VideoCard = ({ video, onWatch, onPdfClick, loading }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return null; }
  };

  const dateTimeStr = formatDateTime(video.created_at || video.createdAt || video.date);

  return (
    <div className="bg-black border border-[#00FF00]/20 hover:border-[#00FF00] transition-all font-mono group">
      {/* Thumbnail */}
      <div className="w-full h-40 bg-gray-900 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
        <div className="absolute inset-0 bg-[#00FF00]/5 z-10 group-hover:bg-transparent"></div>
        {video.video_thumbnail || video.thumbnail ? (
          <img
            src={video.video_thumbnail || video.thumbnail}
            alt={video.Title || video.title}
            className="w-full h-full object-cover opacity-50 group-hover:opacity-100"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#00FF00]/30">
            [VIDEO_FEED_LOST]
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="w-12 h-12 border-2 border-[#00FF00] flex items-center justify-center bg-black/50">
            <span className="text-[#00FF00] text-xl font-bold">{'>'}</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#00FF00]/20">
        <h3 className="text-xs font-bold text-[#00FF00] mb-3 line-clamp-2 min-h-[32px] uppercase">
          {video.Title || video.title || video.name}
        </h3>

        <div className="text-[9px] text-[#00FF00]/50 mb-3 space-y-1">
          {dateTimeStr && <p>TIMESTAMP: {dateTimeStr}</p>}
          {video.duration && <p>SIZE: {video.duration}</p>}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={() => onWatch(video)}
            disabled={loading}
            className="w-full border border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00] hover:text-black text-[10px] font-bold py-1.5 px-3 transition-all uppercase disabled:opacity-30"
          >
            {loading ? 'RUNNING...' : 'EXEC_STREAM'}
          </button>

          {(video.attachments?.length > 0 || video.pdf_link || video.file_link) && onPdfClick && (
            <button 
              onClick={() => onPdfClick(video)}
              className="w-full border border-[#00FF00]/30 text-[#00FF00]/70 hover:border-[#00FF00] hover:text-[#00FF00] text-[10px] font-bold py-1.5 px-3 transition-all uppercase"
            >
              DOWNLOAD_MANUAL.pdf
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
