/**
 * Supabase Cloud Sync for 물건어디
 * - 카카오 사용자 ID 기준으로 Supabase에 데이터 저장/불러오기
 */

const SUPABASE_URL = 'https://koddftotebkjomwmauly.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r_2SdgNd8Rl5nHexSEGxAQ_KX-zJE2I';

let currentUserId = null;

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
};

function setCloudUserId(kakaoUserId) {
    currentUserId = String(kakaoUserId);
    localStorage.setItem('kc_user_id', currentUserId);
}

async function syncToCloud() {
    if (!currentUserId) return;

    try {
        const payload = {
            user_id: currentUserId,
            items: JSON.parse(localStorage.getItem('itemFinder_data') || '[]'),
            rooms: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]'),
            nickname: localStorage.getItem('kc_nickname') || '',
            theme: localStorage.getItem('itemFinder_theme') || 'light',
            updated_at: new Date().toISOString()
        };

        await fetch(`${SUPABASE_URL}/rest/v1/user_data`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn('[Supabase] 저장 실패:', e.message);
    }
}

async function loadFromCloud() {
    if (!currentUserId) return false;

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/user_data?user_id=eq.${currentUserId}&select=*`,
            { headers: headers }
        );
        const data = await res.json();

        if (!data || data.length === 0) {
            await syncToCloud();
            return false;
        }

        const cloud = data[0];
        const localItems = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');
        const cloudItems = cloud.items || [];

        if (localItems.length === 0 && cloudItems.length > 0) {
            localStorage.setItem('itemFinder_data', JSON.stringify(cloudItems));
            localStorage.setItem('itemFinder_rooms', JSON.stringify(cloud.rooms || []));
            if (cloud.nickname) localStorage.setItem('kc_nickname', cloud.nickname);
            if (cloud.theme) localStorage.setItem('itemFinder_theme', cloud.theme);
        } else if (localItems.length > 0 && cloudItems.length > 0) {
            const mergedMap = new Map();
            cloudItems.forEach(item => mergedMap.set(item.id, item));
            localItems.forEach(item => mergedMap.set(item.id, item));
            localStorage.setItem('itemFinder_data', JSON.stringify(Array.from(mergedMap.values())));
            setTimeout(() => syncToCloud(), 1000);
        }

        return true;
    } catch (e) {
        console.warn('[Supabase] 불러오기 실패:', e.message);
        return false;
    }
}

window.syncToCloud = syncToCloud;
window.loadFromCloud = loadFromCloud;
window.setCloudUserId = setCloudUserId;

// 저장된 사용자 ID 복원
const storedUserId = localStorage.getItem('kc_user_id');
if (storedUserId) currentUserId = storedUserId;
