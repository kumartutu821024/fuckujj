import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentApiUrl, getBatches } from '../services/apiService';
import CourseCard from './CourseCard';
import { CourseGridSkeleton } from './LoadingSkeleton';

const ScienceAndFun = () => {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const apiUrl = await getCurrentApiUrl();
      if (!apiUrl) {
        setMessage('FATAL: API_SOURCE_NOT_FOUND');
        setLoading(false);
        return;
      }
      const response = await getBatches();
      const apiBatches = response.data || response || [];
      setBatches(apiBatches);
      if (apiBatches.length === 0) {
        setMessage('INF: NO_NODES_FOUND_ON_SERVER');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('ERR: SERVER_CONNECTION_TERMINATED');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (batchId) => {
    router.push(`/batch/${batchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-8 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 border-b border-[#00FF00]/20 pb-4">
            <div className="h-8 bg-[#00FF00]/10 rounded w-48 animate-pulse"></div>
          </div>
          <CourseGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 font-mono text-[#00FF00]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 border-b border-[#00FF00]/30 pb-4 flex justify-between items-end">
          <h1 className="text-2xl font-bold uppercase tracking-tighter">
            SYSTEM_NODES / ALL_COURSES
          </h1>
          <p className="text-[10px] opacity-40">COUNT: {batches.length}</p>
        </div>

        {/* Message */}
        {message && batches.length === 0 && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="max-w-md w-full border border-red-500 bg-red-900/10 p-8 text-center">
              <div className="text-6xl mb-6 text-red-500">⚠</div>
              <h2 className="text-xl font-bold text-red-500 mb-4 uppercase">System Alert</h2>
              <p className="text-red-400 mb-8">{message}</p>
              <button
                onClick={loadBatches}
                className="border border-red-500 text-red-500 px-8 py-2 font-bold hover:bg-red-500 hover:text-white transition"
              >
                RETRY_CONNECTION
              </button>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {batches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {batches.map((batch) => (
              <CourseCard 
                key={batch.id}
                course={batch}
                onClick={() => handleCourseClick(batch.id)}
              />
            ))}
          </div>
        ) : (
          !message && (
            <div className="text-center py-16 border border-[#00FF00]/10">
              <p className="text-[#00FF00]/50">[DATABASE_EMPTY]</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ScienceAndFun;
