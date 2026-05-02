/**
 * Firebase Cloud Sync for 물건어디
 * - Uses Firebase Firestore to store data per Kakao user ID
 * - Automatically syncs localStorage data to cloud on save
 * - Loads cloud data on login
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ",
    authDomain: "item-finder-app.firebaseapp.com",
    projectId: "item-finder-app",
    storageBucket: "item-finder-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

let db = null;
let currentUserId = null;

// Initialize Firebase
function initFirebase() {
    try {
        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log('[Firebase] 초기화 완료');
        } else if (typeof firebase !== 'undefined' && firebase.apps.length) {
            db = firebase.firestore();
        }
    } catch (e) {
        console.warn('[Firebase] 초기화 실패 - 로컬 저장만 사용됩니다:', e.message);
    }
}

// Set current user ID (called after Kakao login)
function setCloudUserId(kakaoUserId) {
    currentUserId = String(kakaoUserId);
    localStorage.setItem('kc_user_id', currentUserId);
    console.log('[Firebase] 사용자 ID 설정:', currentUserId);
}

// Save data to Firestore
async function syncToCloud() {
    if (!db || !currentUserId) {
        console.log('[Firebase] DB 또는 사용자 ID 없음 - 로컬만 저장');
        return;
    }
    
    try {
        const items = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');
        const rooms = JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]');
        const nickname = localStorage.getItem('kc_nickname') || '';
        const theme = localStorage.getItem('itemFinder_theme') || 'light';
        
        await db.collection('users').doc(currentUserId).set({
            items: items,
            rooms: rooms,
            nickname: nickname,
            theme: theme,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            itemCount: items.length
        }, { merge: true });
        
        console.log(`[Firebase] 클라우드 동기화 완료 (${items.length}개 물건)`);
    } catch (e) {
        console.warn('[Firebase] 클라우드 저장 실패:', e.message);
    }
}

// Load data from Firestore
async function loadFromCloud() {
    if (!db || !currentUserId) {
        console.log('[Firebase] DB 또는 사용자 ID 없음 - 로컬 데이터 사용');
        return false;
    }
    
    try {
        const doc = await db.collection('users').doc(currentUserId).get();
        
        if (doc.exists) {
            const data = doc.data();
            
            // Merge strategy: cloud data wins if local is empty, otherwise ask user
            const localItems = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');
            const cloudItems = data.items || [];
            
            if (localItems.length === 0 && cloudItems.length > 0) {
                // Local is empty, load from cloud
                localStorage.setItem('itemFinder_data', JSON.stringify(cloudItems));
                if (data.rooms && data.rooms.length > 0) {
                    localStorage.setItem('itemFinder_rooms', JSON.stringify(data.rooms));
                }
                if (data.nickname) {
                    localStorage.setItem('kc_nickname', data.nickname);
                }
                if (data.theme) {
                    localStorage.setItem('itemFinder_theme', data.theme);
                }
                console.log(`[Firebase] 클라우드에서 ${cloudItems.length}개 물건 로드 완료`);
                return true;
            } else if (localItems.length > 0 && cloudItems.length > 0) {
                // Both have data - merge by combining unique items
                const mergedMap = new Map();
                cloudItems.forEach(item => mergedMap.set(item.id, item));
                localItems.forEach(item => mergedMap.set(item.id, item)); // local wins on conflict
                const merged = Array.from(mergedMap.values());
                localStorage.setItem('itemFinder_data', JSON.stringify(merged));
                console.log(`[Firebase] 데이터 병합 완료 (${merged.length}개 물건)`);
                
                // Sync merged result back to cloud
                setTimeout(() => syncToCloud(), 1000);
                return true;
            }
        } else {
            // No cloud data, upload local data
            console.log('[Firebase] 클라우드에 데이터 없음 - 로컬 데이터 업로드');
            await syncToCloud();
        }
        
        return false;
    } catch (e) {
        console.warn('[Firebase] 클라우드 로드 실패:', e.message);
        return false;
    }
}

// Make functions globally available
window.syncToCloud = syncToCloud;
window.loadFromCloud = loadFromCloud;
window.setCloudUserId = setCloudUserId;
window.initFirebase = initFirebase;

// Auto-initialize
initFirebase();

// Restore user ID if available
const storedUserId = localStorage.getItem('kc_user_id');
if (storedUserId) {
    currentUserId = storedUserId;
}
