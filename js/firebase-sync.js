/**
 * Supabase Cloud Sync - 그룹 기반 공유 구조
 * - 각자 카카오 계정으로 로그인하되, 같은 그룹 데이터를 공유
 * - 초대 코드로 그룹 합류 가능
 */

const SUPABASE_URL = 'https://koddftotebkjomwmauly.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r_2SdgNd8Rl5nHexSEGxAQ_KX-zJE2I';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
};

let currentUserId = null;
let currentGroupId = null;

// 랜덤 ID 생성
function generateId(length = 12) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

// 사용자 ID 설정 (카카오 로그인 후 호출)
function setCloudUserId(kakaoUserId) {
    currentUserId = String(kakaoUserId);
    localStorage.setItem('kc_user_id', currentUserId);
}

// 사용자의 그룹 ID 조회 또는 신규 생성
async function getOrCreateGroup() {
    if (!currentUserId) return null;

    try {
        // 초대 코드 우선 처리 (기존 그룹보다 먼저 확인)
        const pendingInvite = localStorage.getItem('pending_invite_code');
        if (pendingInvite) {
            const joined = await joinGroup(pendingInvite);
            if (joined) {
                localStorage.removeItem('pending_invite_code');
                return currentGroupId;
            }
            localStorage.removeItem('pending_invite_code');
        }

        // 기존 그룹 확인
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/user_groups?user_id=eq.${currentUserId}&select=group_id`,
            { headers }
        );
        const data = await res.json();

        if (data && data.length > 0) {
            currentGroupId = data[0].group_id;
            localStorage.setItem('kc_group_id', currentGroupId);
            return currentGroupId;
        }

        // 신규 그룹 생성
        const newGroupId = 'GRP-' + generateId();
        const nickname = localStorage.getItem('kc_nickname') || '회원';

        // groups 테이블에 그룹 생성
        await fetch(`${SUPABASE_URL}/rest/v1/groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                group_id: newGroupId,
                items: JSON.parse(localStorage.getItem('itemFinder_data') || '[]'),
                rooms: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]'),
                backups: JSON.parse(localStorage.getItem('itemFinder_backups') || '[]'),
                theme: localStorage.getItem('itemFinder_theme') || 'light',
                updated_at: new Date().toISOString()
            })
        });

        // user_groups 테이블에 사용자-그룹 연결
        await fetch(`${SUPABASE_URL}/rest/v1/user_groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id: currentUserId,
                group_id: newGroupId,
                nickname,
                joined_at: new Date().toISOString()
            })
        });

        currentGroupId = newGroupId;
        localStorage.setItem('kc_group_id', currentGroupId);
        return currentGroupId;

    } catch (e) {
        console.warn('[Supabase] 그룹 조회/생성 실패:', e.message);
        return null;
    }
}

// 초대 코드로 그룹 합류
async function joinGroup(inviteCode) {
    if (!currentUserId) return false;
    try {
        // 초대 코드 조회
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/invite_codes?code=eq.${inviteCode}&select=group_id,expires_at`,
            { headers }
        );
        const data = await res.json();

        if (!data || data.length === 0) {
            alert('유효하지 않은 초대 코드예요.');
            return false;
        }

        const { group_id, expires_at } = data[0];
        if (new Date(expires_at) < new Date()) {
            alert('만료된 초대 코드예요. 새 초대 코드를 받아주세요.');
            return false;
        }

        const nickname = localStorage.getItem('kc_nickname') || '회원';

        // 기존 그룹 연결 삭제 후 새 그룹으로 연결
        await fetch(`${SUPABASE_URL}/rest/v1/user_groups?user_id=eq.${currentUserId}`, {
            method: 'DELETE',
            headers
        });

        await fetch(`${SUPABASE_URL}/rest/v1/user_groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id: currentUserId,
                group_id,
                nickname,
                joined_at: new Date().toISOString()
            })
        });

        currentGroupId = group_id;
        localStorage.setItem('kc_group_id', currentGroupId);
        return true;

    } catch (e) {
        console.warn('[Supabase] 그룹 합류 실패:', e.message);
        return false;
    }
}

// 초대 코드 생성
async function createInviteCode() {
    if (!currentGroupId) await getOrCreateGroup();
    if (!currentGroupId) return null;

    try {
        const code = generateId(8);
        await fetch(`${SUPABASE_URL}/rest/v1/invite_codes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                code,
                group_id: currentGroupId,
                created_by: currentUserId,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
        });
        return code;
    } catch (e) {
        console.warn('[Supabase] 초대 코드 생성 실패:', e.message);
        return null;
    }
}

// 그룹 데이터를 클라우드에 저장
async function syncToCloud() {
    if (!currentGroupId) await getOrCreateGroup();
    if (!currentGroupId) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                group_id: currentGroupId,
                items: JSON.parse(localStorage.getItem('itemFinder_data') || '[]'),
                rooms: JSON.parse(localStorage.getItem('itemFinder_rooms') || '[]'),
                backups: JSON.parse(localStorage.getItem('itemFinder_backups') || '[]'),
                theme: localStorage.getItem('itemFinder_theme') || 'light',
                updated_at: new Date().toISOString()
            })
        });
    } catch (e) {
        console.warn('[Supabase] 저장 실패:', e.message);
    }
}

// 백업만 클라우드에 저장
async function syncBackupsToCloud() {
    if (!currentGroupId) await getOrCreateGroup();
    if (!currentGroupId) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/groups`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                group_id: currentGroupId,
                backups: JSON.parse(localStorage.getItem('itemFinder_backups') || '[]'),
                updated_at: new Date().toISOString()
            })
        });
    } catch (e) {
        console.warn('[Supabase] 백업 저장 실패:', e.message);
    }
}

// 클라우드에서 그룹 데이터 불러오기
async function loadFromCloud() {
    if (!currentGroupId) await getOrCreateGroup();
    if (!currentGroupId) return false;

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/groups?group_id=eq.${currentGroupId}&select=*`,
            { headers }
        );
        const data = await res.json();

        if (!data || data.length === 0) {
            await syncToCloud();
            return false;
        }

        const cloud = data[0];
        const cloudItems = cloud.items || [];
        const localItems = JSON.parse(localStorage.getItem('itemFinder_data') || '[]');

        if (cloudItems.length === 0 && localItems.length === 0) return false;

        // 아이템 병합 (클라우드 + 로컬, 최신 우선)
        const mergedMap = new Map();
        cloudItems.forEach(item => mergedMap.set(item.id, item));
        localItems.forEach(item => mergedMap.set(item.id, item));
        const merged = Array.from(mergedMap.values());
        localStorage.setItem('itemFinder_data', JSON.stringify(merged));

        // 방 목록
        const cloudRooms = cloud.rooms || [];
        if (cloudRooms.length > 0) {
            localStorage.setItem('itemFinder_rooms', JSON.stringify(cloudRooms));
        }

        // 테마
        if (cloud.theme) localStorage.setItem('itemFinder_theme', cloud.theme);

        // 백업 (클라우드가 더 많으면 덮어씀)
        const cloudBackups = cloud.backups || [];
        const localBackups = JSON.parse(localStorage.getItem('itemFinder_backups') || '[]');
        if (cloudBackups.length >= localBackups.length) {
            localStorage.setItem('itemFinder_backups', JSON.stringify(cloudBackups));
        }

        // 변경사항 있으면 클라우드에 병합 결과 반영
        if (localItems.length > 0 && cloudItems.length > 0) {
            setTimeout(() => syncToCloud(), 1000);
        }

        return true;

    } catch (e) {
        console.warn('[Supabase] 불러오기 실패:', e.message);
        return false;
    }
}

// 전역 노출
window.syncToCloud = syncToCloud;
window.loadFromCloud = loadFromCloud;
window.setCloudUserId = setCloudUserId;
window.syncBackupsToCloud = syncBackupsToCloud;
window.createInviteCode = createInviteCode;
window.joinGroup = joinGroup;
window.getOrCreateGroup = getOrCreateGroup;

// 저장된 사용자/그룹 ID 복원
const storedUserId = localStorage.getItem('kc_user_id');
if (storedUserId) currentUserId = storedUserId;

const storedGroupId = localStorage.getItem('kc_group_id');
if (storedGroupId) currentGroupId = storedGroupId;

// URL에 초대 코드가 있으면 저장해두기
const urlParams = new URLSearchParams(window.location.search);
const inviteCode = urlParams.get('invite');
if (inviteCode) {
    localStorage.setItem('pending_invite_code', inviteCode);
}
