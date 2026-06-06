import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getVideoDetails, buildVideoUrl } from '../src/services/apiService';
import { useVideoWatchTracker } from '../src/hooks/useVideoWatchTracker';
import { onAuthChange } from '../src/services/authService';

const PlayerPage = () => {
  const router = useRouter();
  const { course_id, video_id, isLive } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [showQualitySelector, setShowQualitySelector] = useState(true);

  // XP tracking
  const {
    startTracking,
    stopTracking,
    xpEarned,
    nextXpIn,
    progress,
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

      if (!response?.data) {
        throw new Error('No video data received');
      }
      
      const data = response.data;

      setVideoInfo({
        title: data.title || data.Title || 'Video',
        duration: data.duration || data.video_duration || 'Unknown duration',
        playerUrl: data.video_player_url || data.player_url || data.url || '',
        token: data.video_player_token || data.token || ''
      });

    } catch (err) {
      console.error('❌ Error loading video:', err);
      setError(err.message || 'Failed to load video details');
    } finally {
      setLoading(false);
    }
  };

  const handleQualitySelect = (quality) => {
    if (!videoInfo) return;

    setSelectedQuality(quality);

    // Build final URL with token
    let finalUrl = videoInfo.playerUrl;
    if (videoInfo.token) {
      finalUrl = buildVideoUrl(videoInfo.playerUrl, videoInfo.token);
    }

    // Add quality param if needed by the server
    // For now, we just proceed to the player
    setVideoUrl(finalUrl);
    setShowQualitySelector(false);

    // Start XP tracking
    startTracking();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-white text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => router.back()} className="bg-white text-black px-6 py-2 rounded-lg font-bold">Go Back</button>
      </div>
    );
  }

  // Quality Selection UI (Matching the screenshot)
  if (showQualitySelector) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white transition mb-8 w-fit"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Video Info */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {videoInfo?.title}
          </h1>
          <p className="text-gray-500 text-sm">
            Duration: {videoInfo?.duration}
          </p>
        </div>

        {/* Quality Options */}
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-6">Select Quality</h2>

          <div className="space-y-4">
            {['720p', '480p', '360p', '240p'].map((quality) => (
              <button
                key={quality}
                onClick={() => handleQualitySelect(quality)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-800 hover:bg-white/5 transition group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mr-4 group-hover:bg-white/10 transition">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                  </div>
                  <span className="text-lg font-medium">{quality}</span>
                </div>
                <svg className="w-5 h-5 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Actual Video Player UI
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-900">
        <button
          onClick={() => setShowQualitySelector(true)}
          className="text-white flex items-center"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {selectedQuality}
        </button>
        <div className="text-center flex-1 mx-4 truncate">
          <p className="text-white text-sm font-medium truncate">{videoInfo?.title}</p>
        </div>
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">Close</button>
      </div>

      {/* Video / Iframe */}
      <div className="flex-1 relative">
        <iframe
          src={videoUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* XP Tracking Overlay */}
        {currentUser && isTracking && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 pointer-events-none">
            <div className="flex items-center gap-3">
              <span className="text-xl">⭐</span>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">XP Earned</p>
                <p className="text-sm font-bold text-white">+{xpEarned} XP</p>
              </div>
            </div>
            <div className="mt-2 w-32 bg-gray-800 rounded-full h-1">
              <div className="bg-yellow-500 h-1 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[9px] text-gray-500 mt-1 text-center">Next XP in {Math.floor(nextXpIn / 60)}:{(nextXpIn % 60).toString().padStart(2, '0')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerPage;
