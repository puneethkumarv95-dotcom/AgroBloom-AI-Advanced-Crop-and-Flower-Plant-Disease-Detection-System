/**
 * AgroBloom AI - Client-Side Offline Storage & Synchronization Engine
 * Uses browser IndexedDB to persist offline plant disease diagnoses safely.
 */

const DB_NAME = 'AgroBloomOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_detections';

// Helper to open or initialize the IndexedDB instance
const openDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this browser environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'clientLocalId' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Persists an offline diagnostic result into local IndexedDB.
 */
export const saveOfflineRecord = async (diagnosis) => {
  try {
    const db = await openDB();
    const clientLocalId = `off_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      clientLocalId,
      plantType: diagnosis.plantType || 'crop',
      plantName: diagnosis.plantName,
      primaryDisease: diagnosis.primaryDisease,
      condition: diagnosis.condition,
      confidence: diagnosis.confidence,
      topPredictions: diagnosis.topPredictions || [],
      advice: diagnosis.advice || null,
      modelUsed: diagnosis.modelUsed || 'MobileNetV2 (Offline Browser Engine)',
      synced: false,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Offline Storage] IndexedDB write failed, falling back to localStorage:', err.message);
    const key = `agrobloom_off_${Date.now()}`;
    diagnosis.clientLocalId = key;
    diagnosis.synced = false;
    diagnosis.timestamp = new Date().toISOString();
    try {
      localStorage.setItem(key, JSON.stringify(diagnosis));
    } catch (e) {
      // Storage quota
    }
    return diagnosis;
  }
};

/**
 * Retrieves all offline records stored locally.
 */
export const getOfflineRecords = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback: search localStorage
    const records = [];
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('agrobloom_off_')) {
          try {
            records.push(JSON.parse(localStorage.getItem(k)));
          } catch (e) {}
        }
      }
    }
    return records;
  }
};

/**
 * Retrieves all pending (un-synced) offline records.
 */
export const getPendingSyncRecords = async () => {
  const all = await getOfflineRecords();
  return all.filter((r) => !r.synced);
};

/**
 * Marks records as synchronized.
 */
export const markRecordsSynced = async (clientLocalIds) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const id of clientLocalIds) {
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result) {
          const updated = { ...req.result, synced: true };
          store.put(updated);
        }
      };
    }
  } catch (err) {
    console.warn('[Offline Storage] Could not mark records synced in IndexedDB:', err.message);
  }
};

/**
 * Deletes a local offline record.
 */
export const deleteOfflineRecord = async (clientLocalId) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(clientLocalId);
  } catch (err) {
    localStorage.removeItem(clientLocalId);
  }
};

/**
 * Synchronizes pending offline records with backend server.
 */
export const synchronizeOfflineRecords = async (apiClient) => {
  const pending = await getPendingSyncRecords();
  if (pending.length === 0) {
    return { success: true, count: 0, message: 'No offline records pending synchronization.' };
  }

  const res = await apiClient.post('/detections/offline-sync', { records: pending });
  if (res.data.success) {
    const syncedIds = pending.map((r) => r.clientLocalId);
    await markRecordsSynced(syncedIds);
    return {
      success: true,
      count: res.data.syncedCount,
      message: res.data.message
    };
  }
  return res.data;
};

