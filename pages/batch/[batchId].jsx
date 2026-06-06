import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  getCurrentApiUrl, 
  getBatches,
  fetchAllBatchContent,
  getLiveClasses,
  getPreviousLiveClasses
} from '../../src/services/apiService';
import FolderCard from '../../src/components/FolderCard';
import VideoCard from '../../src/components/VideoCard';
import PdfCard from '../../src/components/PdfCard';
import { LiveClassCard, UpcomingClassCard, PreviousLiveCard } from '../../src/components/LiveClassCard';

const BatchDetailPage = () => {
  const router = useRouter();
  const { batchId } = router.query;
  
  const [batch, setBatch] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loadingVideo, setLoadingVideo] = useState(null);
  
  // PDF Modal states
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');
  
  // Live & Upcoming states
  const [liveSubTab, setLiveSubTab] = useState('live');
  const [liveClasses, setLiveClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [previousLiveClasses, setPreviousLiveClasses] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    if (batchId) {
      loadBatchData();
    }
  }, [batchId]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      const apiUrl = await getCurrentApiUrl();
      if (!apiUrl) {
        setMessage('ERR: API_OFFLINE');
        setLoading(false);
        return;
      }

      const batchesResponse = await getBatches();
      const batches = batchesResponse.data || batchesResponse || [];
      const foundBatch = batches.find(b => String(b.id) === String(batchId));
      
      if (!foundBatch) {
        setMessage('ERR: NODE_NOT_FOUND');
        setLoading(false);
        return;
      }
      setBatch(foundBatch);
      
      const batchContent = await fetchAllBatchContent(batchId);
      setContent(batchContent);
      
    } catch (error) {
      console.error('Error:', error);
      setMessage('ERR: DATA_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video) => {
    // Navigate to player page (hacker themed)
    router.push(`/player?course_id=${batchId}&video_id=${video.id}`);
  };

  const handleFolderClick = (folder) => {
    setBreadcrumbs([...breadcrumbs, { id: folder.id, title: folder.Title || folder.title }]);
    setCurrentFolder(folder.id);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setBreadcrumbs([]);
      setCurrentFolder(null);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
  };

  const handlePdfClick = async (pdf) => {
    // PDF Logic (simplified for brevity)
    window.open(pdf.file_link || pdf.pdf_link || pdf.url, '_blank');
  };

  const loadLiveClasses = async () => {
    if (liveClasses.length > 0 || upcomingClasses.length > 0) return;
    try {
      setLoadingLive(true);
      const response = await getLiveClasses(batchId);
      setLiveClasses(response.live || response.data?.live || []);
      setUpcomingClasses(response.upcoming || response.data?.upcoming || []);
    } catch (error) { console.error(error); } finally { setLoadingLive(false); }
  };

  const loadPreviousLiveClasses = async () => {
    if (previousLiveClasses.length > 0) return;
    try {
      setLoadingLive(true);
      const response = await getPreviousLiveClasses(batchId);
      setPreviousLiveClasses(response.data || response || []);
    } catch (error) { console.error(error); } finally { setLoadingLive(false); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'live') loadLiveClasses();
  };

  const handleLiveSubTabChange = (subTab) => {
    setLiveSubTab(subTab);
    if (subTab === 'previous') loadPreviousLiveClasses();
  };

  const handleLiveWatch = (liveClass) => {
    const videoId = liveClass.id || liveClass.video_id;
    router.push(`/player?course_id=${batchId}&video_id=${videoId}&isLive=true`);
  };

  const handlePreviousLiveWatch = (previousClass) => {
    router.push(`/player?course_id=${batchId}&video_id=${previousClass.id}`);
  };

  const getCurrentContent = () => {
    if (!content || content.length === 0) return [];
    if (!currentFolder) {
      return content.filter(item => {
        const hasParentInList = content.some(p => p.material_type === 'FOLDER' && String(p.id) === String(item.parent_id));
        return !hasParentInList;
      });
    }
    return content.filter(item => String(item.parent_id) === String(currentFolder));
  };

  const currentContent = getCurrentContent();
  const folders = currentContent.filter(item => item.material_type === 'FOLDER');
  const videos = currentContent.filter(item => item.material_type === 'VIDEO');
  const pdfs = currentContent.filter(item => item.material_type === 'PDF');

  if (loading) {
    return <div className="min-h-screen bg-black text-[#00FF00] font-mono flex items-center justify-center">FETCHING_BATCH_DATA...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-[#00FF00] font-mono">
      {/* Header */}
      <div className="border-b border-[#00FF00]/30 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-bold uppercase tracking-widest mb-4">
            DIR_ROOT: {batch?.course_name || 'UNDEFINED'}
          </h1>
          <div className="flex space-x-2">
            {['content', 'live'].map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-1 text-xs font-bold border transition ${
                  activeTab === tab ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'border-[#00FF00]/30 hover:border-[#00FF00]'
                }`}
              >
                {tab === 'content' ? 'LOCAL_STORAGE' : 'LIVE_FEED'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'content' && (
          <>
            <div className="mb-6 flex items-center text-[10px] opacity-60 overflow-x-auto whitespace-nowrap pb-2">
              <button onClick={() => handleBreadcrumbClick(-1)} className="hover:text-[#00FF00]">~</button>
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.id}> / <button onClick={() => handleBreadcrumbClick(index)} className="hover:text-[#00FF00]">{crumb.title}</button></span>
              ))}
            </div>

            {message && <div className="mb-6 p-4 border border-red-500 bg-red-900/10 text-red-500 text-xs">{message}</div>}

            {folders.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xs font-bold uppercase mb-4 opacity-50 tracking-[0.2em]">Directories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map(folder => <FolderCard key={folder.id} folder={folder} onClick={() => handleFolderClick(folder)} />)}
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xs font-bold uppercase mb-4 opacity-50 tracking-[0.2em]">Media_Streams</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {videos.map(video => <VideoCard key={video.id} video={video} onWatch={handleVideoClick} onPdfClick={handlePdfClick} loading={loadingVideo === video.id} />)}
                </div>
              </div>
            )}

            {pdfs.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xs font-bold uppercase mb-4 opacity-50 tracking-[0.2em]">Documentation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pdfs.map(pdf => <PdfCard key={pdf.id} pdf={pdf} onClick={() => handlePdfClick(pdf)} />)}
                </div>
              </div>
            )}

            {currentContent.length === 0 && (
              <div className="text-center py-20 border border-[#00FF00]/10">
                <p className="opacity-30 text-xs">[NO_FILES_IN_CURRENT_DIR]</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'live' && (
          <div className="text-center py-20 border border-[#00FF00]/10">
            <p className="opacity-30 text-xs">[LIVE_FEED_INTERRUPTED_OR_EMPTY]</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchDetailPage;
