import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getVideoDetails, buildVideoUrl, appendQueryParam } from '../src/services/apiService';
import { useVideoWatchTracker } from '../src/hooks/useVideoWatchTracker';
import { onAuthChange } from '../src/services/authService';

const PlayerPage = () => {
  const router = useRouter();
  const { course_id, video_id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [executing, setExecuting] = useState(false);

  // XP tracking
  const {
    startTracking,
    isTracking
  } = useVideoWatchTracker(currentUser?.uid, video_id, course_id);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (course_id && video_id) {
      loadVideoDetails();
    }
  }, [course_id, video_id]);

  const loadVideoDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getVideoDetails(video_id, course_id);

      if (!response?.data && !response?.url && !response?.video_url) {
        throw new Error('SYSTEM FAILURE: NO DATA RECEIVED');
      }

      const data = response.data || response;

      setVideoInfo({
        title: data.title || data.Title || 'UNKNOWN_OBJECT',
        duration: data.duration || data.video_duration || '00:00',
        playerUrl: data.video_player_url || data.player_url || data.url || '',
        token: data.video_player_token || data.token || data.key || ''
      });

    } catch (err) {
      console.error('❌ CRITICAL ERROR:', err);
      setError(err.message || 'LINK_FAILURE: 0x882');
    } finally {
      setLoading(false);
    }
  };

  const handleQualitySelect = async (quality) => {
    if (!videoInfo || executing) return;

    setExecuting(true);
    try {
      // 1. Fetch specific quality from API
      console.log(`📡 Requesting stream for quality: ${quality}...`);
      const response = await getVideoDetails(video_id, course_id, quality);
      const data = response.data || response;

      // 2. Extract specific quality URL and token
      let playerUrl = data.video_player_url || data.player_url || data.url || videoInfo.playerUrl;
      let token = data.video_player_token || data.token || data.key || videoInfo.token;

      // 3. Build final encrypted URL
      let finalUrl = buildVideoUrl(playerUrl, token);

      // 4. Force quality parameter in player URL as backup
      const qVal = quality.replace('p', '');
      finalUrl = appendQueryParam(finalUrl, 'quality', qVal);

      console.log(`✅ STREAM_READY: ${quality} link generated.`);

      // 5. Open in new tab
      window.open(finalUrl, '_blank');

      // 6. Start XP tracking in background
      startTracking();

    } catch (e) {
      console.error('❌ EXECUTION_FAILED:', e);
      // Fallback to default URL if specific quality fetch fails
      let fallbackUrl = buildVideoUrl(videoInfo.playerUrl, videoInfo.token);
      fallbackUrl = appendQueryParam(fallbackUrl, 'quality', quality.replace('p', ''));
      window.open(fallbackUrl, '_blank');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-[#00FF00]">
        <div className="text-2xl animate-pulse mb-4">INITIALIZING_DECRYPTION...</div>
        <div className="w-64 bg-gray-900 h-2 rounded-full overflow-hidden border border-[#00FF00]/30">
          <div className="bg-[#00FF00] h-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
        </div>
        <style jsx>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center font-mono text-red-500">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">ACCESS_DENIED</h2>
        <p className="text-red-400 mb-6 border border-red-500/30 p-4 bg-red-900/10">{error}</p>
        <button
          onClick={() => router.back()}
          className="bg-red-600 text-white px-8 py-2 rounded border border-red-400 hover:bg-red-700 transition"
        >
          TERMINATE_SESSION
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#00FF00] p-6 md:p-12 flex flex-col font-mono relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00FF00 1px, transparent 1px), linear-gradient(90deg, #00FF00 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-[#00FF00]/70 hover:text-[#00FF00] transition mb-8 w-fit border border-[#00FF00]/30 px-4 py-1 hover:bg-[#00FF00]/10"
      >
        <span className="mr-2">{'<'}</span>
        RETURN_TO_BASE
      </button>

      {/* Video Info Container */}
      <div className="mb-10 border-l-4 border-[#00FF00] pl-6 py-2 bg-[#00FF00]/5">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 uppercase tracking-tighter">
          TARGET: {videoInfo?.title}
        </h1>
        <div className="flex gap-4 text-xs">
          <p className="text-[#00FF00]/50">
            [DURATION: {videoInfo?.duration}]
          </p>
          <p className="text-[#00FF00]/50">
            [STATUS: {executing ? 'EXECUTING_STREAMS...' : 'READY_TO_EXECUTE'}]
          </p>
        </div>
      </div>

      {/* Quality Selection UI */}
      <div className="max-w-2xl relative z-10">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="animate-pulse mr-2">_</span>
          SELECT_STREAMS_QUALITY
        </h2>

        <div className="space-y-4">
          {['720p', '480p', '360p', '240p'].map((quality) => (
            <button
              key={quality}
              onClick={() => handleQualitySelect(quality)}
              disabled={executing}
              className="w-full flex items-center justify-between p-4 bg-[#111] border border-[#00FF00]/20 hover:border-[#00FF00] hover:bg-[#00FF00]/10 transition-all group rounded-xl disabled:opacity-50"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full border border-[#00FF00]/30 flex items-center justify-center mr-6 group-hover:border-[#00FF00] group-hover:bg-[#00FF00]/10 transition">
                  <svg className="w-6 h-6 text-[#00FF00]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-widest">{quality}</span>
              </div>
              <div className="text-[#00FF00]/50 group-hover:text-[#00FF00]">
                {executing ? (
                  <div className="w-6 h-6 border-2 border-[#00FF00] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hacker Footer */}
      <div className="mt-auto pt-12 text-[10px] text-[#00FF00]/30 flex justify-between">
        <div>CONNECTION: SECURE_SSL_AES256</div>
        <div>SERVER_IP: 192.168.0.101</div>
        <div>SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
      </div>

      {/* XP Tracking Status if active */}
      {isTracking && (
        <div className="fixed top-4 right-4 bg-black border border-[#00FF00] p-4 font-mono text-[10px] shadow-[0_0_15px_rgba(0,255,0,0.2)]">
          <div className="text-[#00FF00] mb-1">XP_HARVEST_ACTIVE</div>
          <div className="w-32 bg-gray-900 h-1 rounded-full">
            <div className="bg-[#00FF00] h-full" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPage;
