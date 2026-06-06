import axios from 'axios';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { buildVideoUrl, normalizeUrl, appendQueryParam } from '../utils/urlUtils';

// ============================================
// CENTRALIZED API CONFIGURATION
// API URL is now stored in Firebase Firestore for persistence
// Falls back to a reliable default if not set
// ============================================

const DEFAULT_BASE_URL = 'https://apiserver-skpg.onrender.com/api/scienceandfun';

// API Base URL - loaded from Firebase
let BASE_URL = '';

// Cache
let apiUrlCache = null;
let apiUrlCacheTime = 0;
const API_URL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const loadApiUrlFromFirebase = async () => {
  try {
    // Return cached value if fresh
    if (apiUrlCache && Date.now() - apiUrlCacheTime < API_URL_CACHE_DURATION) {
      return apiUrlCache;
    }

    console.log('📡 Loading API URL from Firebase...');
    const configDoc = await getDoc(doc(db, 'settings', 'apiConfig'));

    if (configDoc.exists() && configDoc.data().baseUrl) {
      BASE_URL = configDoc.data().baseUrl.replace(/\/$/, '');
      console.log('✅ API Base URL loaded from Firebase:', BASE_URL);
    } else {
      // Use fallback if not set in Firebase
      BASE_URL = DEFAULT_BASE_URL;
      console.log('ℹ️ Using fallback API Base URL:', BASE_URL);

      // Optionally save the fallback to Firebase if you are admin
      // But we'll leave that to the admin panel
    }

    apiUrlCache = BASE_URL;
    apiUrlCacheTime = Date.now();
    return BASE_URL;
  } catch (error) {
    console.error('❌ Error loading API URL from Firebase:', error);
    // Ultimate fallback
    BASE_URL = apiUrlCache || DEFAULT_BASE_URL;
    return BASE_URL;
  }
};

// Initialize on module load (browser only)
if (typeof window !== 'undefined') {
  loadApiUrlFromFirebase();
}

// Update BASE_URL in Firebase (Admin only)
export const updateApiUrl = async (newUrl) => {
  if (!newUrl || typeof newUrl !== 'string') {
    throw new Error('Invalid API URL');
  }

  try {
    new URL(newUrl);
  } catch (e) {
    throw new Error('Invalid URL format. Must start with http:// or https://');
  }

  const cleanUrl = newUrl.trim().replace(/\/$/, '');

  try {
    await setDoc(doc(db, 'settings', 'apiConfig'), {
      baseUrl: cleanUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    });

    BASE_URL = cleanUrl;
    apiUrlCache = cleanUrl;
    apiUrlCacheTime = Date.now();
    console.log('✅ API Base URL updated in Firebase:', BASE_URL);
    return true;
  } catch (error) {
    console.error('❌ Error saving API URL to Firebase:', error);
    throw new Error('Failed to save to Firebase: ' + error.message);
  }
};

// Get current BASE_URL
export const getCurrentApiUrl = async () => {
  if (BASE_URL) return BASE_URL;

  if (apiUrlCache && Date.now() - apiUrlCacheTime < API_URL_CACHE_DURATION) {
    BASE_URL = apiUrlCache;
    return BASE_URL;
  }

  BASE_URL = await loadApiUrlFromFirebase();
  return BASE_URL;
};

// Validate that BASE_URL is configured
const validateBaseUrl = () => {
  if (!BASE_URL || BASE_URL.trim() === '') {
    // If empty, try to use fallback immediately
    BASE_URL = DEFAULT_BASE_URL;
  }
};

const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Aggressive cache for API responses
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Get from cache if available and not expired
const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Using cached data for:', key);
    return cached.data;
  }
  return null;
};

// Save to cache
const saveToCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Centralized API fetch with caching
const secureFetch = async (url, useCache = true) => {
  validateBaseUrl();

  // Check cache first
  if (useCache) {
    const cached = getFromCache(url);
    if (cached) return cached;
  }
  
  console.log('🔒 Secure API Request:', url);
  
  try {
    // Use Next.js proxy to avoid CORS
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const response = await apiClient.get(proxyUrl);
    
    // Save to cache
    if (useCache) {
      saveToCache(url, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ API Request Failed:', error.message);

    // If it's a 404 or other error from proxy, maybe retry once without proxy?
    // No, proxy is usually needed for CORS.

    throw new Error('Unable to load content. Please try again later.');
  }
};

// ============================================
// API ENDPOINTS - All data from BASE_URL only
// ============================================

// Get all batches/courses
export const getBatches = async () => {
  await getCurrentApiUrl(); // Ensure BASE_URL is loaded
  const url = `${BASE_URL}/batches`;
  return await secureFetch(url);
};

// Get content root for a batch
export const getContentRoot = async (batchId) => {
  await getCurrentApiUrl();
  const url = `${BASE_URL}/content?course_id=${batchId}`;
  return await secureFetch(url);
};

// Get folder content (recursive)
export const getFolderContent = async (batchId, folderId) => {
  await getCurrentApiUrl();
  const url = `${BASE_URL}/content?course_id=${batchId}&parent_id=${folderId}`;
  return await secureFetch(url);
};

// Get video details with streaming URL
export const getVideoDetails = async (videoId, batchId) => {
  await getCurrentApiUrl();
  const url = `${BASE_URL}/video-details?video_id=${videoId}&course_id=${batchId}`;
  return await secureFetch(url);
};

// Get live and upcoming classes
export const getLiveClasses = async (batchId) => {
  await getCurrentApiUrl();
  const url = `${BASE_URL}/live?course_id=${batchId}`;
  return await secureFetch(url);
};

// Get previous live classes
export const getPreviousLiveClasses = async (batchId) => {
  await getCurrentApiUrl();
  const url = `${BASE_URL}/previous-live?course_id=${batchId}`;
  return await secureFetch(url);
};

// Get PDF/attachment URL
export const getAttachmentUrl = async (attachmentId, batchId) => {
  await getCurrentApiUrl();
  const url = `${BASE_URL}/attachment?id=${attachmentId}&course_id=${batchId}`;
  return await secureFetch(url);
};

// Export URL utilities for use in components
export { buildVideoUrl, normalizeUrl, appendQueryParam };

// ============================================
// HELPER FUNCTIONS
// ============================================

// Fetch all content recursively for a batch
export const fetchAllBatchContent = async (batchId) => {
  validateBaseUrl();
  
  console.log(`📦 Fetching all content for batch ${batchId}...`);
  
  // Get content root
  const rootResponse = await getContentRoot(batchId);
  const rootFolder = rootResponse.data?.find(item => item.material_type === 'FOLDER');
  
  if (!rootFolder) {
    throw new Error('No root folder found for this batch');
  }
  
  // Recursively fetch all content
  const allContent = await fetchFolderRecursive(batchId, rootFolder.id);
  
  console.log(`✅ Fetched ${allContent.length} items for batch ${batchId}`);
  return allContent;
};

// Recursive folder fetching
const fetchFolderRecursive = async (batchId, folderId, accumulated = [], depth = 0) => {
  if (depth > 10) {
    console.warn('⚠️ Max recursion depth reached');
    return accumulated;
  }
  
  try {
    const response = await getFolderContent(batchId, folderId);
    const items = response.data || [];
    
    accumulated = [...accumulated, ...items];
    
    // Find subfolders and fetch in parallel
    const subfolders = items.filter(i => i.material_type === 'FOLDER');
    
    if (subfolders.length > 0) {
      const subResults = await Promise.all(
        subfolders.map(folder => 
          fetchFolderRecursive(batchId, folder.id, [], depth + 1)
            .catch(err => {
              console.error(`Error fetching subfolder ${folder.id}:`, err.message);
              return [];
            })
        )
      );
      
      subResults.forEach(result => {
        accumulated = [...accumulated, ...result];
      });
    }
    
    return accumulated;
  } catch (error) {
    console.error(`Error fetching folder ${folderId}:`, error.message);
    return accumulated;
  }
};
