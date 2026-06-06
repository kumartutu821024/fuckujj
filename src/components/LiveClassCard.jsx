import React, { useState, useEffect } from 'react';

// Hacker themed Live Class Card
export const LiveClassCard = ({ liveClass, onWatch }) => {
  return (
    <div className="bg-black border border-red-500/30 hover:border-red-500 transition-all font-mono group">
      <div className="relative w-full h-40 bg-gray-900 grayscale group-hover:grayscale-0">
        {liveClass.thumbnail || liveClass.video_thumbnail ? (
          <img 
            src={liveClass.thumbnail || liveClass.video_thumbnail}
            alt={liveClass.title || liveClass.Title}
            className="w-full h-full object-cover opacity-50 group-hover:opacity-100"
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-red-500/30">
            [LIVE_SIGNAL_ENCRYPTED]
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 animate-pulse flex items-center border border-red-400">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-ping"></span>
            LIVE_FEED
          </span>
        </div>
      </div>
      <div className="p-4 border-t border-red-500/20">
        <h3 className="text-xs font-bold text-red-500 mb-4 line-clamp-2 min-h-[32px] uppercase">
          {liveClass.title || liveClass.Title || liveClass.name}
        </h3>
        <button
          onClick={() => onWatch(liveClass)}
          className="w-full border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-[10px] font-bold py-1.5 px-3 transition-all uppercase"
        >
          INTERCEPT_SIGNAL
        </button>
      </div>
    </div>
  );
};

export const UpcomingClassCard = ({ upcomingClass }) => {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const calculateCountdown = () => {
      const startTime = upcomingClass.start_time || upcomingClass.startTime || upcomingClass.scheduled_at;
      if (!startTime) return;
      const targetDate = new Date(startTime);
      if (isNaN(targetDate.getTime())) return;
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) { setCountdown('00:00:00:00'); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${days}D:${hours}H:${minutes}M:${seconds}S`);
    };
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [upcomingClass]);

  return (
    <div className="bg-black border border-cyan-500/30 font-mono">
      <div className="relative w-full h-40 bg-gray-900 grayscale">
        {upcomingClass.thumbnail || upcomingClass.video_thumbnail ? (
          <img 
            src={upcomingClass.thumbnail || upcomingClass.video_thumbnail}
            alt={upcomingClass.title || upcomingClass.Title}
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cyan-500/30">
            [UPCOMING_EVENT]
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-cyan-600 text-white text-[8px] font-bold px-2 py-0.5 border border-cyan-400">
            SCHEDULED
          </span>
        </div>
      </div>
      <div className="p-4 border-t border-cyan-500/20">
        <h3 className="text-xs font-bold text-cyan-500 mb-2 uppercase truncate">
          {upcomingClass.title || upcomingClass.Title || upcomingClass.name}
        </h3>
        <div className="text-[10px] text-cyan-400 font-bold bg-cyan-900/10 p-2 border border-cyan-900/30 text-center">
          T-MINUS: {countdown}
        </div>
      </div>
    </div>
  );
};

export const PreviousLiveCard = ({ previousClass, onWatch, loading }) => {
  return (
    <div className="bg-black border border-[#00FF00]/20 hover:border-[#00FF00] transition-all font-mono group">
      <div className="w-full h-40 bg-gray-900 relative overflow-hidden grayscale group-hover:grayscale-0">
        {previousClass.thumbnail || previousClass.video_thumbnail ? (
          <img
            src={previousClass.thumbnail || previousClass.video_thumbnail}
            alt={previousClass.title || previousClass.Title}
            className="w-full h-full object-cover opacity-50 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#00FF00]/30">
            [ARCHIVE_STREAM]
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[#00FF00]/20">
        <h3 className="text-xs font-bold text-[#00FF00] mb-4 line-clamp-2 min-h-[32px] uppercase">
          {previousClass.title || previousClass.Title || previousClass.name}
        </h3>
        <button
          onClick={() => onWatch(previousClass)}
          disabled={loading}
          className="w-full border border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00] hover:text-black text-[10px] font-bold py-1.5 px-3 transition-all uppercase disabled:opacity-30"
        >
          {loading ? 'RUNNING...' : 'EXEC_ARCHIVE'}
        </button>
      </div>
    </div>
  );
};

export default { LiveClassCard, UpcomingClassCard, PreviousLiveCard };
